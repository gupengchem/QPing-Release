/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved. 
 */
"use strict";
const router = require('express').Router();
const request = require('request');
const api = require('../utils/api');
const logger = global.log4js.getLogger('data');
const loginLog = global.log4js.getLogger('login');

/**
 * 登录验证
 */
router.use('/login', function (req, res, next) {
    req.session = req.session || {};
    req.session.userData = {
        userId: 1,
        userCode: req.body.username || 'admin',
        userName: req.body.username || 'admin',
        language: req.headers["accept-language"] && req.headers["accept-language"].substr(0, 2)
    };
    res.json({success: true, msg: ''})
});

router.all('*', api.apiAuthentication);

// 该路由使用的中间件
router.use(function timeLog(req, res, next) {
    logger.info('data::' + req.path);
    next();
});

/**
 * 转发请求
 */
router.use('/', function (req, res, next) {
    if (req.header('mySessionCode')
        && req.header('mySessionCode') !== req.session.userData.userCode) {
        res.json({success: false, code: 417, msg: '登录用户的会话已改变，请刷新页面'});
        return;
    }
    let realUri = pathMapping(req.originalUrl);
    if (!realUri) {
        res.json({success: false, code: 404, msg: 'No api route.'});
        return;
    }
    if (realUri.indexOf('/{') > 0) {
        res.json({success: false, code: 503, msg: 'Api Route Error:存在未替换变量'});
        return;
    }
    if (req.query.__image__) {
        request(realUri).pipe(res);
        return;
    }
    logger.warn("Real Uri:" + realUri);
    /**
     * 设置发送到后台的对象的公共值
     * @type {*|void}
     */
    let bodyData = global.tool.extend(req.body, {
        uid: global.tool.uuid(),
        creator: req.session.userData.userCode,
        updator: req.session.userData.userCode,
        language: req.session.userData.language,
        equipment: global.tool.endTypeEnum[req.session.endType]
    });
    if (req.method === 'POST') {//如果是POST请求，则把后面的?参数放到JSON中去
        if (!bodyData.properties)
            bodyData.properties = {};
        for (let k in req.query) {
            bodyData.properties[k] = req.query[k];
        }
    }
    logger.warn("Real Uri:" + realUri);
    global.tool.send({
        method: req.method,
        uri: realUri,
        json: bodyData
    }, function (error, response, body) {
        if (body)
            res.json(body);
        else
            res.json({success: false, msg: '后台服务请求出错'})
    });
});

/**
 * 根据映射关系，进行地址转换
 * 发送的地址为：/api/uuid@pathv1=v1&pathv2=v2?paramv1=pv1&paramv2=pv2
 *
 * @param path
 */
function pathMapping(path) {
    let sUrl = path.match(/\/api\/([\w-]+)@*([^\?]*)\?*(.*)/),
        uuid = sUrl[1],
        pathVar = sUrl[2],
        paramVar = sUrl[3],
        realUri = api.get(uuid),
        pathVar_ = pathVar.split('&'),
        items,
        regExp;
    if (realUri) {
        for (let i = 0; i < pathVar_.length; i++) {
            items = pathVar_[i].split("=");
            regExp = new RegExp('{' + items[0] + '}');
            realUri = realUri.replace(regExp, items[1]);
        }
        if (paramVar)
            realUri += '?' + paramVar;
    }
    return realUri;
}

module.exports = router;