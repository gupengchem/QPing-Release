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
    form.uploadDir = global.config.alipayRasFilePath;	 //设置上传目录
    //form.uploadDir = "\/home\/sodexho\/app\/media\/images\/";
    form.keepExtensions = true;	 //保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小

    let returnData = [];

    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log('error')
        }
        let privateFile = files.privateFile,publicFile = files.publicFile;

        let fileName;
        if(privateFile)
            fileName = privateFile.path;
        if(publicFile)
            fileName = publicFile.path;
        if(fileName) {
            fileName = fileName.substring(fileName.indexOf('upload_'));
            console.log(files);
            console.log("===========================================================================");
            console.log(fields);
            let result = "{\"name\":\""+ fileName +"\", \"state\": \"SUCCESS\"}";
            res.set('Content-Type', 'text/html;charset=utf-8');
            res.send(result);
        } else {
            res.send("{\"state\":\"FAILURE\"}");
        }
    });
});

module.exports = router;
