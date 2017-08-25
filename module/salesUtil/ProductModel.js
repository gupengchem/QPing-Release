/**
 * Created by wangshuyi on 2016/12/27.
 */

'use strict';

/**
 * 菜单管理
 */

const uuid = require('uuid');

const mongoose = require('../util/mongoDB'),
    Schema = mongoose.Schema;
const config = require('../../config/config');
const Constant = require('../../config/systemConstant');

const schema = new Schema({
    _id : {type : String, default: uuid.v4},
    name : { type: String },                        //名称
    code: {type: String, unique: true, default: uuid.v4},             //编码

    shortName : { type: String },                   //短名
    appName : { type: String },                     //app名称
    image : { type: String, ref:'U_File' },         //图片
    price : { type: String },                       //价格
    reviewFlag : { type: Number, default: 0 },      //是否需评价订单
    feedbackFlag : { type: Number, default: 0 },    //是否需评价店铺
    store : { type: String, ref: 'T_Store' },       //所属店铺

    tenant : { type: String, ref : "M_Tenant" },    //所属租户

    state : { type: Number, default : 1},           //状态
    createTime: {type: Date, default: Date.now},    //创建时间
    creater: {type: String, ref : "M_User", default: config.dbUser.robot._id},          //创建者
    updateTime : { type: Date, default: Date.now},  //最后更新时间
    updater : { type: String, ref : "M_User", default: config.dbUser.robot._id}         //最后更新者
});

const Model = mongoose.model('T_Product',schema);

module.exports = Model;
