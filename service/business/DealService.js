/**
* Created by wangshuyi on 8/17/2017, 6:54:19 PM.
*/

'use strict';

const extend = require('extend');
const logger = require('log4js').getLogger("sys");

const CommonService = require("../../service/common/dbService");
const Model = require("../../module/business/DealModel");

const defaultParams = {
    model : Model
};

class ModuleService extends CommonService{
    constructor(param){
        super(param);
        this.opts = extend(true, {}, this.opts, defaultParams, param);
        this._name = "D_AttributeService";
    }
}

module.exports = new ModuleService();


