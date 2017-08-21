
'use strict';
const express = require('express');
const router = express.Router();

const ModelService = require('../../service/metaModel/ModelService');

router.get('*', function(req, res, next) {
    req.viewParam = {__curMenu:'Business'};

    next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
    req.viewParam = Object.assign(req.viewParam, {a:1});

    next();
});

module.exports = router;
