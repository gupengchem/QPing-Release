/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved.
 */

const express = require('express');
const router = express.Router();

const formidable = require('formidable');
const fs = require('fs');

/* GET home page. */
router.post('/', function(req, res, next) {
    console.log('upload start');
    let form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';		//设置编辑
    form.uploadDir = global.config.uploadPath;	 //设置上传目录
    form.keepExtensions = true;	 //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小

    let returnData = [];

    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log('error')
        }
        //因为formidable自动实现了文件的重命名，所以我们这里不需要在重新指定名称了。
        let fileName = files.upfile.path;
        fileName = fileName.substring(fileName.indexOf('upload_'));
        console.log(files);
        console.log("===========================================================================");
        console.log(fields);
        res.send(fileName);
    });
});

module.exports = router;
