/**
* Created by wangshuyi on 8/24/2017, 10:34:03 PM.
*/

'use strict';

const extend = require('extend');
const fs = require('fs');
const logger = require('log4js').getLogger("sys");

const CommonService = require("../../service/common/dbService");
const Model = require("../../module/salesUtil/SalesModel");
const pdfReader = require('../../module/util/pdfReader');
const tool = require('../../module/util/tool');

const StoreService = require('./StoreService');
const BuyerService = require('./BuyerService');
const ProductService = require('./ProductService');
const FileService = require("../system/tool/FileService");

const defaultParams = {
    model : Model
};

let pdfFolder = __dirname + '/../../OrderFileFolder';
let uploadFolder = __dirname + '/../../public/uploadFiles';

class ModuleService extends CommonService{
    constructor(param){
        super(param);
        this.opts = extend(true, {}, this.opts, defaultParams, param);
        this._name = "T_SalesService";
    }

    /**
     *
     * @param curUser
     * @param id
     * @param data
     * @param type = order / review / feedback
     * @return {Promise}
     */
    updateOrderNoById(curUser, id, data, type){
        return new Promise((resolve, reject) => {
            FileService.findById(curUser, data[type+'File']).then(orderFile => {
                super.findById(curUser, id, [{
                    path: 'product',
                    populate: {
                        path: 'store',
                }}]).then(sales => {
                    let folder = tool.date2string(sales.date, 'yyyyMMdd');

                    let fileType = orderFile.name.split('.');
                    let filePath = `${folder}/${sales.product.store.name}_${sales.product.searchName}_${data.orderNo || sales.orderNo}_${type}.${fileType[fileType.length - 1]}`;
                    if(!fs.existsSync(`${pdfFolder}/finished/${folder}`)){
                        fs.mkdirSync(`${pdfFolder}/finished/${folder}`);
                    }
                    fs.renameSync(uploadFolder + orderFile.filePath,
                        `${pdfFolder}/finished/${filePath}`);
                    let salesData;
                    switch (type){
                        case 'order':
                            salesData = {
                                orderNo : data.orderNo,
                                orderFile: filePath,
                            };
                            break;
                        case 'review':
                            salesData = {
                                reviewFlag : data.reviewFlag,
                                reviewFile: filePath,
                            };
                            break;
                        case 'feedback':
                            salesData = {
                                feedbackFlag : data.feedbackFlag,
                                feedbackFile: filePath,
                            };
                            break;
                    }
                    this.reviewById(curUser, sales._id, salesData).then(saveResult => {
                        FileService.removeById(curUser, orderFile._id).then(r => {
                            resolve({result: true, data: saveResult});
                        });
                    });
                });
            });
        });
    }
    saveWithStore(curUser, data){
        return new Promise((resolve, reject) => {
            ProductService.findById(curUser, data.product).then(product => {
                data.store = product.store;

                super.save(curUser, data).then(
                    data => resolve(data),
                    err => reject(err)
                )
            });
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
            let t = new Date();
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
                                    buyerWithoutProduct.push(buyerWithStore[i])
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

    processFile(curUser){
        return new Promise((resolve, reject) => {
            let allPromise = [], result = {
                order: {
                    success: 0,
                    fail: 0,
                },
                review: {
                    success: 0,
                    fail: 0,
                }
            };
            tool.traversalFolderSync(pdfFolder+'/new/emailPdf', {
                eachFile : (path, pathArr, level) => {
                    allPromise.push(this.processEmailPdf(curUser, path));
                }
            });
            tool.traversalFolderSync(pdfFolder+'/new/webPdf', {
                eachFile : (path, pathArr, level) => {
                    allPromise.push(this.processWebPdf(curUser, path, pathArr[0].replace(/\d*\.pdf/g, '')));
                }
            });

            Promise.all(allPromise).then(data => {
                data.forEach(d => {
                    if(d.data.orderId){
                        if(d.result){
                            result.order.success++;
                        }else{
                            result.order.fail++;
                        }
                    }else{
                        if(d.result){
                            result.review.success++;
                        }else{
                            result.review.fail++;
                        }
                    }
                });

                resolve(result);
            });
        });
    }

    processEmailPdf(curUser, pdfPath){
        return new Promise((resolve, reject) => {
            pdfReader.loadEmailPdf(pdfPath).then(data => {
                BuyerService.find(curUser, {name: data.buyer}).then(buyerList => {
                    if(buyerList.length === 1){
                        let buyer = buyerList[0];
                        ProductService.find(curUser, {searchName: data.productName.replace(/ /g, '').substr(0, 15)}, 'store').then(productList => {
                            if(productList.length === 1){
                                let product = productList[0];
                                super.findOne(curUser, {buyer: buyer._id, product: product._id}).then(sales => {
                                    if(sales){
                                        let folder = tool.date2string(sales.date, 'yyyyMMdd');
                                        let type = data.orderId?'order':'review';

                                        if(type === 'review' && !sales.orderNo){
                                            resolve({result: false, data: data});
                                        }else{
                                            let filePath = `${folder}/${product.store.name}_${product.searchName}_${data.orderId || sales.orderNo}_${type}.pdf`;
                                            if(!fs.existsSync(`${pdfFolder}/finished/${folder}`)){
                                                fs.mkdirSync(`${pdfFolder}/finished/${folder}`);
                                            }
                                            fs.renameSync(pdfPath,
                                                `${pdfFolder}/finished/${filePath}`);
                                            let salesData;
                                            if(type === 'order'){
                                                salesData = {
                                                    orderNo : data.orderId,
                                                    orderFile: filePath,
                                                };
                                            }else{
                                                salesData = {
                                                    reviewFlag : 1,
                                                    reviewFile: filePath,
                                                };
                                            }
                                            this.reviewById(curUser, sales._id, salesData).then(saveResult => {
                                                resolve({result: true, data: data});
                                            });
                                        }
                                    }else{
                                        resolve({result: false, data: data});
                                    }
                                });
                            }else{
                                resolve({result: false, data: data});
                            }
                        });
                    }else{
                        resolve({result: false, data: data});
                    }
                })
            });
        });
    }
    processWebPdf(curUser, pdfPath, buyerName){
        return new Promise((resolve, reject) => {
            pdfReader.loadWebPdf(pdfPath).then(data => {
                BuyerService.find(curUser, {name: buyerName}).then(buyerList => {
                    if(buyerList.length === 1){
                        let buyer = buyerList[0];
                        let findAllProductPromise = [];
                        data.productName.forEach(productName => {
                            findAllProductPromise.push(ProductService.find(curUser, {searchName: productName.replace(/ /g, '').substr(0, 15)}, 'store'));
                        });
                        Promise.all(findAllProductPromise).then(productList => {
                            let findAllsalesPromise = [];
                            productList.forEach(products => {
                                findAllsalesPromise.push(new Promise((resolve, reject) => {
                                    if(products.length === 1){
                                        let product = products[0];
                                        super.findOne(curUser, {buyer: buyer._id, product: product._id}).then(sales => {
                                            if(sales){
                                                let folder = tool.date2string(sales.date, 'yyyyMMdd');
                                                let type = data.orderId?'order':'review';
                                                let filePath = `${folder}/${product.store.name}_${product.searchName}_${data.orderId || sales.orderNo}_${type}.pdf`;
                                                if(!fs.existsSync(`${pdfFolder}/finished/${folder}`)){
                                                    fs.mkdirSync(`${pdfFolder}/finished/${folder}`);
                                                }
                                                fs.writeFileSync(`${pdfFolder}/finished/${filePath}`, fs.readFileSync(pdfPath));
                                                let salesData;
                                                if(type === 'order'){
                                                    salesData = {
                                                        orderNo : data.orderId,
                                                        orderFile: filePath,
                                                    };
                                                }else{
                                                    salesData = {
                                                        reviewFlag : 1,
                                                        reviewFile: filePath,
                                                    };
                                                }
                                                this.reviewById(curUser, sales._id, salesData).then(saveResult => {
                                                    resolve({result: true, data: data});
                                                });
                                            }else{
                                                resolve({result: false, data: data});
                                            }
                                        });
                                    }else{
                                        resolve({result: false, data: data});
                                    }
                                }));
                            });

                            Promise.all(findAllsalesPromise).then(results => {
                                let flag = true;
                                results.some(result => {
                                    if(result.result === false){
                                        flag = false;
                                        return true;
                                    }
                                });
                                if(flag){
                                    fs.unlinkSync(pdfPath);
                                }
                                resolve({result: flag, data: data});
                            })
                        });
                    }else{
                        resolve({result: false, data: data});
                    }
                })
            });
        });
    }
}

let service = new ModuleService();
module.exports = service;

// service.processFile({tenant:"33f0fe38-fcd1-4f11-8a55-1831821b38c5"}).then(result => {
//     console.log(`order处理：成功${result.order.success}条，失败${result.order.fail}条。\nreview处理：成功${result.review.success}条，失败${result.review.fail}条。`)
// });


