"use strict";

const router = require('express').Router();

const editorConfig = require('../config/editorConfig');

// ueditor validate
router.get('/', function(req, res, next) {
    res.send(editorConfig);
});

module.exports = router;
