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
}

module.exports = new ModuleService();


