/**
 * Created by wangshuyi on 1/20/2017, 9:18:54 AM.
 */

'use strict';
const express = require('express');
const router = express.Router();

const resUtil = require("../../module/util/resUtil");

const service = require("../../service/system/auth/UserService");

//导入
router.get('/findByCode/:code',function (req, res,next) {
    let code = req.params.code;
    if(code){
        service.findOne(req.curUser, {code:code}).then(
            user => res.send(resUtil.success({data : user})),
            err => res.send(resUtil.error())
        )
    } else {
        res.send(resUtil.error({message:"param error"}));
    }
});

module.exports = router;
