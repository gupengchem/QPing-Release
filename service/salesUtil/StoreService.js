/**
* Created by wangshuyi on 8/24/2017, 6:02:51 PM.
*/

'use strict';

const extend = require('extend');
const logger = require('log4js').getLogger("sys");

const CommonService = require("../../service/common/dbService");
const Model = require("../../module/salesUtil/StoreModel");

const defaultParams = {
    model : Model
};

class ModuleService extends CommonService{
    constructor(param){
        super(param);
        this.opts = extend(true, {}, this.opts, defaultParams, param);
        this._name = "T_StoreService";
    }
}

module.exports = new ModuleService();


