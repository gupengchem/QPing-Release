/**
 * Created by wangshuyi on 2016/12/27.
 */

'use strict';

/**
 * 公众号
 */

const uuid = require('uuid');
const mongoose = require('../util/mongoDB'),
    Schema = mongoose.Schema;
const config = require('../../config/config');

const schema = new Schema({
    _id : {type : String, default: uuid.v4},
    code : {type : String},                         //编码
    name : { type: String },                        //名称
    remark : { type: String },                      //备注

    state : { type: Number, default : 1},           //状态，是否删除
    createTime: {type: Date, default: Date.now},    //创建时间
    creater: {type: String, ref : "User", default: config.dbUser.robot._id},          //创建者
    updateTime : { type: Date, default: Date.now},  //最后更新时间
    updater : { type: String, ref : "User", default: config.dbUser.robot._id}         //最后更新者
});

const model = mongoose.model('M_Tenant',schema);


module.exports = model;
