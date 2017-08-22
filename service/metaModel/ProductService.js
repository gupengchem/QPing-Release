/**
* Created by wangshuyi on 8/14/2017, 9:34:43 AM.
*/

'use strict';

const extend = require('extend');
const logger = require('log4js').getLogger("sys");

const CommonService = require("../../service/common/dbService");
const Model = require("../../module/metaModel/ProductModel");

const defaultParams = {
    model : Model
};

class ModuleService extends CommonService{
    constructor(param){
        super(param);
        this.opts = extend(true, {}, this.opts, defaultParams, param);
        this._name = "D_ProductService";
    }
    save(curUser, data){
        let params = [];
        let key;

        for(key in data.params){
            params.push({
                key: key,
                value: data.params[key]
            })
        }

        data.params = params;

        return super.save(curUser, data);
    }
    updateById(curUser, id, data){
        let params = [];
        let key;

        for(key in data.params){
            params.push({
                key: key,
                value: data.params[key]
            })
        }

        data.params = params;

        return super.updateById(curUser, id, data);
    }
    findObjById(curUser, id, populate, fields){
        return new Promise((resolve, reject) => {
            super.findById(curUser, id, populate, fields).then(product => {
                let params = {};
                if(product){

                    product.params.forEach(p => {
                        params[p.key] = p.value;
                    });

                    product._doc.params = params;
                }

                resolve(product);
            }, err => reject(err));
        })
    }
}

module.exports = new ModuleService();


