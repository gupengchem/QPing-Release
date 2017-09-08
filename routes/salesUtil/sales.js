/**
* Created by wangshuyi on 8/24/2017, 10:34:03 PM.
*/

'use strict';

const extend = require('extend');

const express = require('express');
const router = express.Router();

const logger = require('log4js').getLogger("sys");

const resUtil = require("../../module/util/resUtil");
const reqUtil = require("../../module/util/reqUtil");

const service = require("../../service/salesUtil/SalesService");

const formidable = require('formidable');
const xlsx = require('node-xlsx');
const JSZip = require('jszip');
const fs = require('fs');

let pdfFolder = __dirname + '/../../OrderFileFolder/finished/';
let zipFolder = __dirname + '/../../OrderFileFolder/zip/';

/* GET users listing. */
//列表
router.post('/list', function(req, res, next) {
    let condition = req.body, query = req.query,
    populate = 'product buyer store';
    condition = reqUtil.formatCondition(condition);
    let sort = {date: -1};

    service
        .findForPage(req.curUser, query.pageSize, query.pageNumber, condition, populate, sort)
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
//上传订单信息 / 上传review / 上传feedback
router.post('/updateInfo/:type/:id', function(req, res, next) {
    let data = req.body;
    let _id = req.params.id;
    let type = req.params.type;

    service
        .updateOrderNoById(req.curUser, _id, data, type)
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
//新增
router.post('/quickCreate', function(req, res, next) {
    let data = req.body;

    service
        .quickCreate(req.curUser, data, data.count)
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
                    if(data[3]){_data['product'] = data[3];}
                    if(data[4]){_data['status'] = data[4];}
                    if(data[5]){_data['date'] = data[5];}
                    if(data[6]){_data['orderNo'] = data[6];}
                    if(data[7]){_data['buyer'] = data[7];}
                    if(data[8]){_data['store'] = data[8];}
                    if(data[9]){_data['reviewFlag'] = data[9];}
                    if(data[10]){_data['reviewDate'] = data[10];}
                    if(data[11]){_data['feedbackFlag'] = data[11];}
                    if(data[12]){_data['feedbackDate'] = data[12];}
                    if(data[13]){_data['orderImg'] = data[13];}
                    if(data[14]){_data['reviewImg'] = data[14];}
                    if(data[15]){_data['feedbackImg'] = data[15];}
                    if(data[16]){_data['tenant'] = data[16];}
                    if(data[17]){_data['state'] = data[17];}
                    if(data[18]){_data['createTime'] = data[18];}
                    if(data[19]){_data['creater'] = data[19];}
                    if(data[20]){_data['updateTime'] = data[20];}
                    if(data[21]){_data['updater'] = data[21];}

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
    let condition = req.query,
    _data = [];
    condition = reqUtil.formatCondition(condition);

    let exportType = condition.exportType, fileNamePrefix;
    delete condition.exportType;

    service.find(req.curUser, condition, 'store product', {store: 1}).then(data => {
        if(data.length == 0){
            res.send(resUtil.error({message:'此条件无销售记录'}));
        }else{
            let zip = new JSZip();

            let amount = 0;
            _data.push([
                'No.',
                'Seller',
                'Product',
                'Search Term Spot',
                'Price',
                'Order#',
                'Order PDF File',
                'Review PDF File',
                'Feedback PDF File',
            ]);

            data.forEach((d, i) => {
                _data.push([
                    i,
                    d.store?d.store.name:'',
                    d.product?d.product.name:'',
                    d.product?d.product.keyword:'',
                    d.product?`$${d.product.price}`:'',
                    d.orderNo,
                    d.orderFile?d.orderFile.substr(9):'',
                    d.reviewFile?d.reviewFile.substr(9):'',
                    d.feedbackFile?d.feedbackFile.substr(9):'',
                ]);
                amount += d.product.price - 0;

                if(d.orderFile){
                    zip.folder("orderPdf").file(d.orderFile.substr(9), fs.readFileSync(`${pdfFolder}${d.orderFile}`));
                }
                if(d.reviewFile){
                    zip.folder("reviewPdf").file(d.reviewFile.substr(9), fs.readFileSync(`${pdfFolder}${d.reviewFile}`));
                }
                if(d.feedbackFile){
                    zip.folder("feedbackPdf").file(d.feedbackFile.substr(9), fs.readFileSync(`${pdfFolder}${d.feedbackFile}`));
                }
                if(i === 0){
                    if(exportType === 'product'){
                        fileNamePrefix = d.product.searchName;
                    }else{
                        fileNamePrefix = d.store.name;
                    }
                }
            });
            _data.push([
                '',
                '',
                '',
                '',
                `Total: $${amount}`,
                '',
                '',
                '',
                '',
            ]);

            const buffer = xlsx.build([{name: "report", data: _data}]);
            let __name = `${tool.date2string(new Date(), 'yyyyMMddhhmmss')}-${fileNamePrefix}-${tool.date2string(condition.date.$gte, 'yyyyMMdd')}-${tool.date2string(condition.date.$lte, 'yyyyMMdd')}`;
            let fileName = `report.xlsx`;
            let zipFileName = `${__name}.zip`;

            fs.writeFile(`${__dirname}/../../${fileName}`, buffer, function () {
                zip.file(fileName, fs.readFileSync(`${__dirname}/../../${fileName}`));

                zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
                    .pipe(fs.createWriteStream(`${zipFolder}${zipFileName}`))
                    .on('finish', function () {
                        fs.unlink(`${__dirname}/../../${fileName}`);
                        res.send(resUtil.success());
                    });
            });
        }
    });
});

//处理pdf
router.get('/processPdf', function(req, res, next) {
    service.processFile(req.curUser).then(result => {
        res.send(resUtil.success({data: result}));
    })
});

module.exports = router;
