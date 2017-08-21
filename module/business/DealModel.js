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
    code : { type: String },                        //名称
    customerId : { type: String },                  //
    payMethod : {type : String},                    //支付方式
    happenTime : {type : String},                   //支付时间

    appId : {type : String},                        //
    mchId : {type : String},                        //
    subMchId : {type : String},                     //
    deviceId : {type : String},                     //设备Id
    wechatOrder : {type : String},                  //微信单号
    orderNo : {type : String},                      //订单号
    userDn : {type : String},                       //会员员
    payType : {type : String},                      //微信支付方式
    payStatus : {type : String},                    //微信支付状态
    bank : {type : String},                         //
    currency : {type : String},                     //币种
    refundId : {type : String},                     //
    mchRefundId : {type : String},                  //
    refundType : {type : String},                   //
    refundStatus : {type : String},                 //
    productName : {type : String},                  //产品名称
    nonceStr : {type : String},                     //
    rate : {type : String},                         //
    totalAmount : {type : String},                  //总金额
    promotionAmount : {type : String},              //
    refundAmount : {type : String},                 //
    promotionRefund : {type : String},              //
    charge : {type : String},                       //
    customerName : {type : String},                 //
    rowNum : {type : String},                       //
    properties : {type : String},                   //

    tenant : { type: String, ref : "M_Tenant" },    //所属租户

    state : { type: Number, default : 1},           //状态，是否删除
    createTime: {type: Date, default: Date.now},    //创建时间
    creater: {type: String, ref : "M_User", default: config.dbUser.robot._id},          //创建者
    updateTime : { type: Date, default: Date.now},  //最后更新时间
    updater : { type: String, ref : "M_User", default: config.dbUser.robot._id}         //最后更新者
});

const model = mongoose.model('B_Deal',schema);


module.exports = model;
