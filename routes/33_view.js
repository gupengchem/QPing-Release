
'use strict';
const extend = require('extend');
const path = require('path');

const express = require('express');
const router = express.Router();

const log4js = require('log4js');
const logger = log4js.getLogger("sys");

/* GET users listing. */
router.get('*', function(req, res, next) {
    let url = req._url;
    try{
        res.render(url.substr(1), extend({}, req.defaultParam, {body:req.viewParam}));
    }catch(e){
        logger.error('请求' + url + '报错');
        logger.error(e);
        throw e;
    }
});

module.exports = router;
