/**
* Created by wangshuyi on 8/8/2017, 2:04:11 PM.
*/

'use strict';
const express = require('express');
const router = express.Router();

const logger = require('log4js').getLogger("sys");

const resUtil = require("../../../module/util/resUtil");
const reqUtil = require("../../../module/util/reqUtil");

const service = require("../../../service/system/auth/OrgService");

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
router.get('/tree', function(req, res, next) {
    let condition = req.query;
    condition = reqUtil.formatCondition(condition);

    service
        .tree(req.curUser, '', condition)
        .then(
            data => res.send(resUtil.success(data)),
            err => res.send(resUtil.error())
        );
});

//所有
router.post('/find', function(req, res, next) {
    let condition = req.body, query = req.query,
    populate = '', sort = {'sort':1};
    condition = reqUtil.formatCondition(condition);

    service
        .find(req.curUser, condition, populate, sort)
        .then(
            data => res.send(resUtil.success({rows:data})),
            err => res.send(resUtil.error())
        );
});
router.get('/find', function(req, res, next) {
    let condition = req.query,
    populate = '', sort = {'sort':1};
    condition = reqUtil.formatCondition(condition);

    service
        .find(req.curUser, condition, populate, sort)
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
//新增
router.post('/updateUser', function(req, res, next) {
    let data = req.body;

    service
        .updateUsers(req.curUser, data)
        .then(
            data => res.send(resUtil.success()),
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
    let populate = 'parent';

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
                    if(data[3]){_data['parent'] = data[3];}else{_data['parent'] = '';}
                    if(data[4]){_data['__type'] = data[4];}
                    if(data[5]){_data['tenant'] = data[5];}
                    if(data[6]){_data['state'] = data[6];}
                    if(data[7]){_data['createTime'] = data[7];}
                    if(data[8]){_data['creater'] = data[8];}
                    if(data[9]){_data['updateTime'] = data[9];}
                    if(data[10]){_data['updater'] = data[10];}

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
            '上级节点',
            '节点类型',
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
                d['parent'],
                d['__type'],
                d['tenant'],
                d['state'],
                d['createTime'],
                d['creater'],
                d['updateTime'],
                d['updater'],
            ]);
        });

        const buffer = xlsx.build([{name: "M_Org", data: _data}]);
        let fileName = `/M_Org_export${tool.dateFormatter(new Date(), 'yyyyMMdd')}.xlsx`;
        fs.writeFile(`${__dirname}/../../${fileName}`, buffer, function () {
            res.download(`${__dirname}/../../${fileName}`, fileName, function () {
                fs.unlink(`${__dirname}/../../${fileName}`);
            });
        });
    });
});

module.exports = router;
