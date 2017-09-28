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
    code: {type: String, unique: true},             //编码
    payType: {type: String},                        //付款方式
    payAccount: {type: String},                     //账号
    wechatId: {type: String},                       //微信ID
    remark: {type: String},                         //备注

    tenant : { type: String, ref : "M_Tenant" },    //所属租户

    state : { type: Number, default : 1},           //状态
    createTime: {type: Date, default: Date.now},    //创建时间
    creater: {type: String, ref : "M_User", default: config.dbUser.robot._id},          //创建者
    updateTime : { type: Date, default: Date.now},  //最后更新时间
    updater : { type: String, ref : "M_User", default: config.dbUser.robot._id}         //最后更新者
});

const Model = mongoose.model('T_Buyer',schema);

module.exports = Model;
