/**
* Created by wangshuyi on 5/22/2017, 3:19:31 PM.
*/

'use strict';

const extend = require('extend');
const logger = require('log4js').getLogger("sys");

const CommonService = require("../../../service/common/dbService");
const Model = require("../../../module/system/auth/UserModel");

const defaultParams = {
    model : Model,
    findCondition: (curUser) => {
        let condition = { state: 1 };
        return condition;
    },
    saveExtend: (curUser) => {
        return {}
    }
};

class ModuleService extends CommonService{
    constructor(param){
        super(param);
        this.opts = extend(true, {}, this.opts, defaultParams, param);
        this._name = "UserService";
    }
}

module.exports = new ModuleService();


