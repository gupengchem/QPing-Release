
'use strict';
const express = require('express');
const router = express.Router();

const ModelService = require('../../service/metaModel/ModelService');

router.get('*', function(req, res, next) {
    req.viewParam = {__curMenu:'MetaModel'};

    next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
    req.viewParam = Object.assign(req.viewParam, {a:1});

    next();
});


router.get('/productEdit', function(req, res, next) {
    let modelId = req.query.model;

    if(modelId){
        ModelService.getAttributeById(req.curUser, modelId).then(attrs => {
            req.viewParam = Object.assign(req.viewParam, {attrs:attrs});

            next();
        }, err => next());
    }else{
        next();
    }


});

module.exports = router;
