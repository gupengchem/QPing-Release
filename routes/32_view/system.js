
'use strict';
const express = require('express');
const router = express.Router();

router.get('*', function(req, res, next) {
    req.viewParam = {__curMenu:'sysMgr'};

    next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
    req.viewParam = Object.assign(req.viewParam, {a:1});

    next();
});

module.exports = router;
