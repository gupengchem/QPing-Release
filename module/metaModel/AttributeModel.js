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

const schema = new Schema({
    _id : {type : String, default: uuid.v4},
    name : { type: String },                        //名称
    code : {type : String},                         //编码
    required : {type: Number, default: 0},          //是否必填
    defaultValue : { type: String },                //默认值
    i18n: {type: Number, default: 0},               //是否支持国际化

    inputType : { type: String },                   //输入类型
    //number
    min: {type: Number},
    max: {type: Number},
    decimal: {type: Number},
    //string
    minLength: {type: Number},
    maxLength: {type: Number},
    //dict
    options: {type: String},
    //other
    params: {type: Object},                         //自定义属性参数

    tenant : { type: String, ref : "M_Tenant" },    //所属租户

    state : { type: Number, default : 1},           //状态，是否删除
    createTime: {type: Date, default: Date.now},    //创建时间
    creater: {type: String, ref : "M_User", default: config.dbUser.robot._id},          //创建者
    updateTime : { type: Date, default: Date.now},  //最后更新时间
    updater : { type: String, ref : "M_User", default: config.dbUser.robot._id}         //最后更新者
});

const model = mongoose.model('D_Attribute',schema);


module.exports = model;
