'use strict';
const express = require('express');
const router = express.Router();

const UserService = require('../service/system/auth/UserService');

const resUtil = require("../module/util/resUtil");

router.get('/getToken', function(req, res, next){
    let query = req.query, condition = {};
    if(query){
        condition.code = query.username;
        condition.password = query.password;
    }

    UserService.findOne(query).then(user => {
        if(user){
            res.send(resUtil.success({token: user._id}));
        }else{
            res.send(resUtil.error({errorCode:-1, message:'用户名或密码不正确'}));
        }
    }, err => {
        res.send(resUtil.error({errorCode:-1, message:"系统出错"}));
    });
});

router.use("*", function (req, res, next) {
    let query = req.query || {};

    if(query.token){
        UserService.findById({}, query.token).then(user => {
            if(user){
                req.curUser = user;
                next();
            }else{
                res.send(resUtil.forbidden({message:'无效的token'}));
            }
        }, err => res.send(resUtil.error()));
    }else{
        res.send(resUtil.forbidden());
    }
});

module.exports = router;
