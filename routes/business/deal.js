/**
* Created by wangshuyi on 8/17/2017, 6:54:19 PM.
*/

'use strict';

const extend = require('extend');

const express = require('express');
const router = express.Router();

const logger = require('log4js').getLogger("sys");

const resUtil = require("../../module/util/resUtil");
const reqUtil = require("../../module/util/reqUtil");

const service = require("../../service/business/DealService");

const formidable = require('formidable');
const xlsx = require('node-xlsx');
const fs = require('fs');

/* GET users listing. */
//列表
router.post('/list', function(req, res, next) {
    let condition = req.body, query = req.query,
    populate = '';
    condition = reqUtil.formatCondition(condition);

    service
        .findForPage(req.curUser, query.pageSize, query.pageNumber, condition, populate)
        .then(
            data => res.send(resUtil.success(data)),
            err => res.send(resUtil.error())
        );
});
//所有
router.get('/find', function(req, res, next) {
    let condition = req.query;
    condition = reqUtil.formatCondition(condition);

    service
        .find(req.curUser, condition)
        .then(
            data => res.send(resUtil.success({rows:data})),
            err => res.send(resUtil.error())
        );
});
//更新
router.post('/save/:id', function(req, res, next) {
    let data = req.body;
    let _id = req.params.id;

    service
        .updateById(req.curUser, _id, data)
        .then(
            data => res.send(resUtil.success({data:data})),
            err => res.send(resUtil.error())
        );
    });
//新增
router.post('/save', function(req, res, next) {
    let data = req.body;

    service
        .save(req.curUser, data)
        .then(
            data => res.send(resUtil.success({data:data})),
            err => res.send(resUtil.error())
        );
});
//删除
router.get('/remove/:id', function(req, res, next) {
    let _id = req.params.id;

    service
        .removeById(req.curUser, _id)
        .then(
            data => res.send(resUtil.success({data:data})),
            err => res.send(resUtil.error())
        );
});
//批量删除
router.post('/remove', function(req, res, next) {
    let body = req.body;
    let condition = {
        _id : {"$in" : body.ids}
    };

    service
        .remove(req.curUser, condition)
        .then(
            data => res.send(resUtil.success({data:data})),
            err => res.send(resUtil.error())
        );
});
//详情
router.get('/detail/:id', function(req, res, next) {
    let _id = req.params.id;
    let populate = "";

    service
        .findById(req.curUser, _id, populate)
        .then(
            data => res.send(resUtil.success({data:data})),
            err => res.send(resUtil.error())
        );
});

//导入
router.post('/import', function (req, res, next) {
    let form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';		//设置编辑
    form.keepExtensions = true;	 //保留后缀
    form.maxFieldsSize = 5 * 1024 * 1024;   //文件大小

    form.parse(req, function (err, fields, files) {
        if (err) {
            logger.error("Error:" + err);
            res.send(resUtil.error({
                message : "文件上传失败"
            }));
        }else{
            let file,
            importData = [],
            ids = [];
            file = files.media;

            const workSheetsFromFile = xlsx.parse(file.path);
            workSheetsFromFile[0].data.forEach(function (data,i) {
                if(i > 0 && data.length > 0){
                    let _data = {};

                    if(data[0]){ids.push(data[0]);_data['_id'] = data[0];}
                    if(data[1]){_data['name'] = data[1];}
                    if(data[2]){_data['code'] = data[2];}
                    if(data[3]){_data['customerId'] = data[3];}
                    if(data[4]){_data['payMethod'] = data[4];}
                    if(data[5]){_data['happenTime'] = data[5];}
                    if(data[6]){_data['appId'] = data[6];}
                    if(data[7]){_data['mchId'] = data[7];}
                    if(data[8]){_data['subMchId'] = data[8];}
                    if(data[9]){_data['deviceId'] = data[9];}
                    if(data[10]){_data['wechatOrder'] = data[10];}
                    if(data[11]){_data['orderNo'] = data[11];}
                    if(data[12]){_data['userDn'] = data[12];}
                    if(data[13]){_data['payType'] = data[13];}
                    if(data[14]){_data['payStatus'] = data[14];}
                    if(data[15]){_data['bank'] = data[15];}
                    if(data[16]){_data['currency'] = data[16];}
                    if(data[17]){_data['refundId'] = data[17];}
                    if(data[18]){_data['mchRefundId'] = data[18];}
                    if(data[19]){_data['refundType'] = data[19];}
                    if(data[20]){_data['refundStatus'] = data[20];}
                    if(data[21]){_data['productName'] = data[21];}
                    if(data[22]){_data['nonceStr'] = data[22];}
                    if(data[23]){_data['rate'] = data[23];}
                    if(data[24]){_data['totalAmount'] = data[24];}
                    if(data[25]){_data['promotionAmount'] = data[25];}
                    if(data[26]){_data['refundAmount'] = data[26];}
                    if(data[27]){_data['promotionRefund'] = data[27];}
                    if(data[28]){_data['charge'] = data[28];}
                    if(data[29]){_data['customerName'] = data[29];}
                    if(data[30]){_data['rowNum'] = data[30];}
                    if(data[31]){_data['properties'] = data[31];}
                    if(data[32]){_data['tenant'] = data[32];}
                    if(data[33]){_data['state'] = data[33];}
                    if(data[34]){_data['createTime'] = data[34];}
                    if(data[35]){_data['creater'] = data[35];}
                    if(data[36]){_data['updateTime'] = data[36];}
                    if(data[37]){_data['updater'] = data[37];}

                    importData.push(_data);
                }
            });

            service.remove(req.curUser, {_id:{'$in':ids}}).then(()=>{
                service.create(req.curUser, importData).then(result => {
                    fs.unlinkSync(file.path);
                    res.send(resUtil.success());
                }, err => {
                    res.send(resUtil.error({massage: err}));
                });
            }, err => {
                res.send(resUtil.error({massage: err}));
            });
        }
    });
});
//导出
router.get('/export', function(req, res, next) {
    let condition = req.query, tableConfig,
    _data = [],
    i, j, y;
    condition = reqUtil.formatCondition(condition);

    service.find(req.curUser, condition).then(data => {
        _data.push([
            '_id',
            '名称',
            '编码',
            'customerId',
            'payMethod',
            'happenTime',
            'appId',
            'mchId',
            'subMchId',
            'deviceId',
            'wechatOrder',
            'orderNo',
            'userDn',
            'payType',
            'payStatus',
            'bank',
            'currency',
            'refundId',
            'mchRefundId',
            'refundType',
            'refundStatus',
            'productName',
            'nonceStr',
            'rate',
            'totalAmount',
            'promotionAmount',
            'refundAmount',
            'promotionRefund',
            'charge',
            'customerName',
            'rowNum',
            'properties',
            '租户',
            '状态',
            '创建时间',
            '创建人',
            '更新时间',
            '更新人',
        ]);

        data.forEach(d => {
            _data.push([
                d['_id'],
                d['name'],
                d['code'],
                d['customerId'],
                d['payMethod'],
                d['happenTime'],
                d['appId'],
                d['mchId'],
                d['subMchId'],
                d['deviceId'],
                d['wechatOrder'],
                d['orderNo'],
                d['userDn'],
                d['payType'],
                d['payStatus'],
                d['bank'],
                d['currency'],
                d['refundId'],
                d['mchRefundId'],
                d['refundType'],
                d['refundStatus'],
                d['productName'],
                d['nonceStr'],
                d['rate'],
                d['totalAmount'],
                d['promotionAmount'],
                d['refundAmount'],
                d['promotionRefund'],
                d['charge'],
                d['customerName'],
                d['rowNum'],
                d['properties'],
                d['tenant'],
                d['state'],
                d['createTime'],
                d['creater'],
                d['updateTime'],
                d['updater'],
            ]);
        });

        const buffer = xlsx.build([{name: "D_Attribute", data: _data}]);
        let fileName = `/D_Attribute_export${tool.dateFormatter(new Date(), 'yyyyMMdd')}.xlsx`;
        fs.writeFile(`${__dirname}/../../${fileName}`, buffer, function () {
            res.download(`${__dirname}/../../${fileName}`, fileName, function () {
                fs.unlink(`${__dirname}/../../${fileName}`);
            });
        });
    });
});

module.exports = router;
