"use strict";
const router = require('express').Router();
const fs = require('fs');

router.use('*', function (req, res, next) {
    if(global.config.production) {
        let files = fs.readdirSync("/nfs_store/sessions/backoffice");
        let files2 = fs.readdirSync("/nfs_store/sessions/frontend");//D:\\workspace\\changyu\\breezee-web\\breezee-frontend\\bin\\sessions\\frontend
        res.json({
            success: true, msg: "成功", "sessionlist": {
                "backoffice": files.length,
                "frontend": files2.length
            }
        });
    } else {
        res.json({
            success: true, msg: "成功", "sessionlist": {
                "backoffice": 0,
                "frontend": 0
            }
        });
    }
});

module.exports = router;