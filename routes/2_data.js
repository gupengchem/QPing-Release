
'use strict';
const express = require('express');
const router = express.Router();

const api = require('../module/util/api');
const resUtil = require("../module/util/resUtil");

const log4js = require('log4js');
const logger = log4js.getLogger("sys");

/* GET users listing. */
router.use('*', function(req, res, next) {
    try{
        let realUri = api.pathMapping(req.originalUrl);
        if (!realUri) {
            res.json({success: false, code: 404, msg: 'No api route.'});
            return;
        }
        if (realUri.indexOf('/{') > 0) {
            res.json({success: false, code: 503, msg: 'Api Route Error:存在未替换变量'});
            return;
        }

        /**
         * 设置发送到后台的对象的公共值
         * @type {*|void}
         */
        // let bodyData = global.tool.extend(req.body, {
        //     createBy: req.session.userData.userCode,
        //     modifiedBy: req.session.userData.userCode,
        //     language: req.session.userData.language,
        //     equipment: global.tool.endTypeEnum[req.session.endType]
        // });
        let bodyData = req.body;

        if (req.method == 'POST') {//如果是POST请求，则把后面的?参数放到JSON中去
            if (!bodyData.properties)
                bodyData.properties = {};
            for (let k in req.query) {
                bodyData.properties[k] = req.query[k];
            }
        }
        logger.warn("Real Uri:", realUri, "Method:",req.method);
        global.tool.send({
            method: req.method,
            uri: realUri,
            json: bodyData
        }, function (error, response, body) {
            if (body)
                res.json(resUtil.success(body));
            else
                res.json({success: false, msg: '后台服务请求出错'})
        });
    }catch (e){
        logger.error(e);
        throw e;
    }
});

module.exports = router;
