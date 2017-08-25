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

    product: {type: String, ref:'T_Product'},       //产品
    status: {type: String, default: 'created'},     //订单状态，created/unReview/unFeedback/unReturn/finished
    date: {type: Date},                             //下单时间

    orderNo: {type: String},                        //订单号
    buyer: {type: String, ref:'T_Buyer'},           //买手
    store: {type: String, ref:'T_Store'},           //店铺
    reviewFlag: {type: Number, default: 0},         //是否已review
    reviewDate: {type: Date},                       //review时间
    feedbackFlag: {type: Number, default: 0},       //是否已feedback
    feedbackDate: {type: Date},                     //feedback时间

    orderImg: {type: String, ref:'U_File'},         //订单图片
    reviewImg: {type: String, ref:'U_File'},        //review图片
    feedbackImg: {type: String, ref:'U_File'},      //feedback图片

    tenant : { type: String, ref : "M_Tenant" },    //所属租户

    state : { type: Number, default : 1},           //状态
    createTime: {type: Date, default: Date.now},    //创建时间
    creater: {type: String, ref : "M_User", default: config.dbUser.robot._id},          //创建者
    updateTime : { type: Date, default: Date.now},  //最后更新时间
    updater : { type: String, ref : "M_User", default: config.dbUser.robot._id}         //最后更新者
});

const Model = mongoose.model('T_Sales',schema);

module.exports = Model;
