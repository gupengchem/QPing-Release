/**
 * Created by wangshuyi on 2016/12/27.
 */

'use strict';

/**
 * 元模型-属性管理
 */

const uuid = require('uuid');
const mongoose = require('../util/mongoDB'),
    Schema = mongoose.Schema;
const config = require('../../config/config');

const paramSchema = new Schema({
    key : { type: String},                         //编码
    value : {type: String},                        //文本
});

const schema = new Schema({
    _id : {type : String, default: uuid.v4},
    name : { type: String },                       //名称
    code : {type : String},                        //编码
    model : {type : String, ref: 'D_Model'},       //编码

    //other
    params: [paramSchema],                         //扩展属性

    tenant : { type: String, ref : "M_Tenant" },    //所属租户

    state : { type: Number, default : 1},           //状态，是否删除
    createTime: {type: Date, default: Date.now},    //创建时间
    creater: {type: String, ref : "M_User", default: config.dbUser.robot._id},          //创建者
    updateTime : { type: Date, default: Date.now},  //最后更新时间
    updater : { type: String, ref : "M_User", default: config.dbUser.robot._id}         //最后更新者
});

const model = mongoose.model('D_Product',schema);


module.exports = model;
