/**
 * Created by wangshuyi on 2016/12/27.
 */

'use strict';

/**
 * 用户信息
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
    link: {type: String },                          //链接
    icon: {type: String },                          //图标
    sort : { type: Number },                        //排序

    parent : { type: String, ref: 'Menu' },         //父级节点
    __type: {type: String, default : Constant.TREE_MODEL.LEAF},       //节点类型

    state : { type: Number, default : 1},           //状态
    createTime: {type: Date, default: Date.now},    //创建时间
    creater: {type: String, ref : "M_User", default: config.dbUser.robot._id},          //创建者
    updateTime : { type: Date, default: Date.now},  //最后更新时间
    updater : { type: String, ref : "M_User", default: config.dbUser.robot._id}         //最后更新者
});

const Model = mongoose.model('Menu',schema);

module.exports = Model;
