/**
 * Created by wangshuyi on 2016/12/27.
 */

'use strict';

/**
 * 用户管理
 */

const uuid = require('uuid');

const mongoose = require('../../util/mongoDB'),
    Schema = mongoose.Schema;
const config = require('../../../config/config');

const schema = new Schema({
    _id : {type : String, default: uuid.v4},
    name : { type: String },                        //名称
    code: {type: String, unique: true},             //编码
    password : { type: String },                    //密码
    phone : { type: Number },                       //手机号
    email: {type: String},                          //邮箱
    type : { type: String },                        //会员类型
    icon : { type: String },                        //头像
    org: {type: String, ref : "M_Org" },           //所属组织
    role : { type: String, ref : "M_Role" },        //所属角色

    tenant : { type: String, ref : "M_Tenant" },    //所属租户

    state : { type: Number, default : 1},           //状态
    createTime: {type: Date, default: Date.now},    //创建时间
    creater: {type: String, ref : "M_User", default: config.dbUser.robot._id},          //创建者
    updateTime : { type: Date, default: Date.now},  //最后更新时间
    updater : { type: String, ref : "M_User", default: config.dbUser.robot._id}         //最后更新者
});

const Model = mongoose.model('M_User',schema);

module.exports = Model;
