/**
* Created by wangshuyi on 8/8/2017, 1:12:24 PM.
*/

'use strict';

const extend = require('extend');
const logger = require('log4js').getLogger("sys");

const CommonService = require("../../service/common/dbService");
const Model = require("../../module/system/TenantModel");

const defaultParams = {
    model : Model,
    findCondition: (curUser) => {
        return { state: 1 }
    },
    saveExtend: (curUser) => {
        return {}
    }
};

class ModuleService extends CommonService{
    constructor(param){
        super(param);
        this.opts = extend(true, {}, this.opts, defaultParams, param);
        this._name = "M_TenantService";
    }
}

module.exports = new ModuleService();


