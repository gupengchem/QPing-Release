/**
 * Created by wangshuyi on 2016/12/27.
 */

'use strict';

/**
 * 用户信息
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
    org: {type: String},                            //所属组织
    role : { type: String, ref : "Role" },          //所属角色
    state : { type: Number, default : 1},           //状态
    createTime: {type: Date, default: Date.now},    //创建时间
    creater: {type: String, ref : "User", default: config.dbUser.robot._id},          //创建者
    updateTime : { type: Date, default: Date.now},  //最后更新时间
    updater : { type: String, ref : "User", default: config.dbUser.robot._id}         //最后更新者
});

const Model = mongoose.model('User',schema);

module.exports = Model;
