/**
* Created by wangshuyi on 8/24/2017, 10:34:03 PM.
*/

'use strict';

const extend = require('extend');
const logger = require('log4js').getLogger("sys");

const CommonService = require("../../service/common/dbService");
const Model = require("../../module/salesUtil/SalesModel");

const BuyerService = require('./BuyerService');
const ProductService = require('./ProductService');

const defaultParams = {
    model : Model
};

class ModuleService extends CommonService{
    constructor(param){
        super(param);
        this.opts = extend(true, {}, this.opts, defaultParams, param);
        this._name = "T_SalesService";
    }
    updateOrderNoById(curUser, id, data){
        return new Promise((resolve, reject) => {
            super.findById(curUser, id, 'product').then(sales => {
                let status = this.getState(sales);
                data.status = status;
                super.updateById(curUser, id, data).then(
                    result => resolve(result),
                    err => reject(err)
                )
            })
        });
    }
    reviewById(curUser, id, data){
        return new Promise((resolve, reject) => {
            super.findById(curUser, id, 'product').then(sales => {
                let status = this.getState(sales, data);
                data.status = status;
                super.updateById(curUser, id, data).then(
                    result => resolve(result),
                    err => reject(err)
                )
            })
        });
    }
    quickCreate(curUser, data, count){
        return new Promise((resolve, reject) => {
            let t = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
            let createData = Object.assign({
                date: t,
                tenant: curUser.tenant,
            }, data);

            ProductService.findById(curUser, data.product).then(product => {
                createData.store = product.store;
                this.getBestBuyer(curUser, product).then(buyer => {
                    if(buyer){
                        createData.buyer = buyer._id;
                    }

                    super.save(curUser, createData).then(
                        result => resolve(result),
                        err => reject(err)
                    )
                });
            });
        });
    }

    getBestBuyer(curUser, product){
        return new Promise((resolve, reject) => {
            let buyerWithoutStore = [],
                buyerWithStore = [];

            BuyerService.find(curUser, {}, '', {name: 1}).then(buyers => {
                let findPromise = [];
                buyers.forEach(b => {
                    findPromise.push(super.findForPage(curUser, 1, 0, {store: product.store, buyer: b._id}, '', {date: -1}));
                });

                Promise.all(findPromise).then(salesList => {
                    salesList.forEach((s, i) => {
                        if(s.rows.length > 0){
                            buyers[i]._doc.sales = s.rows[0];
                            buyerWithStore.push(buyers[i]);
                        }else{
                            buyerWithoutStore.push(buyers[i]);
                        }
                    });

                    if(buyerWithoutStore.length > 0){
                        if(buyerWithoutStore.length === 1){
                            resolve(buyerWithoutStore[0]);
                        }else{
                            this.getOldestBuyer(curUser, buyerWithoutStore).then(buyer => {
                                resolve(buyer);
                            });
                        }
                    }else{
                        let buyerWithoutProduct = [], buyerWithProduct = [];

                        findPromise = [];
                        buyerWithStore.forEach(b => {
                            findPromise.push(super.findForPage(curUser, 1, 0, {product: product._id, buyer: b._id}, '', {date: -1}));
                        });

                        Promise.all(findPromise).then(salesList => {
                            salesList.forEach((s, i) => {
                                if(s.rows.length > 0){
                                    buyerWithStore[i]._doc.sales = s.rows[0];
                                    buyerWithProduct.push(buyerWithStore[i]);
                                }else{
                                    buyerWithoutProduct.push()
                                }
                            });

                            if(buyerWithoutProduct.length > 0){
                                if(buyerWithoutProduct.length === 1){
                                    resolve(buyerWithoutProduct[0]);
                                }else{
                                    this.getOldestBuyer(curUser, buyerWithoutProduct).then(buyer => {
                                        resolve(buyer);
                                    });
                                }
                            }else{
                                resolve(null);
                                // this.getOldestBuyer(curUser, buyerWithProduct).then(buyer => {
                                //     resolve(buyer);
                                // });
                            }
                        });
                    }
                })
            });
        });
    }
    getOldestBuyer(curUser, buyerList){
        return new Promise((resolve, reject) => {
            let findPromise = [];
            buyerList.forEach(b => {
                findPromise.push(super.findForPage(curUser, 1, 0, {buyer: b._id}, '', {date: -1}));
            });

            Promise.all(findPromise).then(salesList => {
                salesList.forEach((s, i) => {
                    if(s.rows.length > 0){
                        buyerList[i]._doc.sales = s.rows[0];
                    }
                });

                buyerList.sort((a, b) => {
                    let flag;
                    if(!a._doc.sales && !b._doc.sales){
                        flag = 0;
                    }else if(!a._doc.sales){
                        flag = -1
                    }else if(!b._doc.sales){
                        flag = 1;
                    }else if(a._doc.sales.date.getTime() === b._doc.sales.date.getTime()){
                        flag = 0;
                    }else{
                        flag = a._doc.sales.date.getTime() < b._doc.sales.date.getTime()?-1:1;
                    }

                    return flag;
                });

                resolve(buyerList[0]);
            });
        })
    }
    getState(sales, data = {}){
        let status;
        if(sales.product.reviewFlag && !(sales.reviewFlag || data.reviewFlag)){
            if(sales.product.feedbackFlag && !(sales.feedbackFlag || data.feedbackFlag)){
                status = 'unReturn';
            }else{
                status = 'unReview';
            }
        }else{
            if(sales.product.feedbackFlag && !(sales.feedbackFlag || data.feedbackFlag)){
                status = 'unFeedback';
            }else{
                status = 'finished';
            }
        }
        return status;
    }
}

let service = new ModuleService();
module.exports = service;



