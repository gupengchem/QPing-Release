
'use strict';
const express = require('express');
const router = express.Router();

const resUtil = require("../module/util/resUtil");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.redirect(global.config.path.contextPath+'/view/salesUtil/salesPortal');
});

router.use('*', function(req, res, next) {
    let language, loginFlag, dataFlag;

    language = req.headers["accept-language"] || 'zh-CN';
    req.setLocale(language.substr(0,2));

    // req.endType = "";
    req.endType = global.tool.endType(req.headers['user-agent']);

    req.defaultParam = {
        path : null,
        redirect : null,
        data : req.query || {},
        body : {},
        userData:req.session.userData,
        cookie : req.cookies
    };

    //check login
    loginFlag = Boolean(req.session.userData);

    if(loginFlag){
        req.curUser = req.session.userData;
        next();
    }else{
        dataFlag = req.headers["ajax-flag"];
        if(dataFlag){
            res.send(resUtil.forbidden());
        }else{
            res.redirect(global.config.path.contextPath+'/login?redirect='+encodeURIComponent(req.baseUrl));
        }
    }
});

module.exports = router;
