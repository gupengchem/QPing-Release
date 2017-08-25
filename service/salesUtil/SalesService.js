/**
* Created by wangshuyi on 8/24/2017, 10:34:03 PM.
*/

'use strict';

const extend = require('extend');
const logger = require('log4js').getLogger("sys");

const CommonService = require("../../service/common/dbService");
const Model = require("../../module/salesUtil/SalesModel");

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
            let createData = [], i;
            let t = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
            for(i = 0; i < count; i++){
                createData.push(Object.assign({
                    date: t,
                    tenant: curUser.tenant,
                }, data));
            }
            super.create(curUser, createData).then(
                result => resolve(result),
                err => reject(err)
            )
        });
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

module.exports = new ModuleService();


