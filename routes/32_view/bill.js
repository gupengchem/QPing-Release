
'use strict';
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    req.viewParam = {a:1};

    next();
});

module.exports = router;
