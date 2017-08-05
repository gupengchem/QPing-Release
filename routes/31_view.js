
'use strict';
const express = require('express');
const router = express.Router();

const logger = require('log4js').getLogger("sys");

/* GET users listing. */
router.get('*', function(req, res, next) {
    try{
        let url;

        url = req.url;
        if(!/^\//.test(url)){
            url = "/" + url;
        }

        if(url.indexOf("?") >= 0){ url = url.substring(0, url.indexOf("?")); }

        req._url = url;
        req.defaultParam.path = url;

        next();

    }catch(e){
        logger.error('请求' + url + '报错');
        logger.error(e);
        throw e;
    }
});

module.exports = router;
