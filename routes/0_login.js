'use strict';
const express = require('express');
const router = express.Router();
const logger = require('log4js').getLogger("login");

const MenuService = require('../service/system/MenuService');
const UserService = require('../service/system/auth/UserService');

const resUtil = require("../module/util/resUtil");

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session.userData){
        res.redirect('/view/index');
    }else{
        req.endType = "";
        // req.endType = global.tool.endType(req.headers['user-agent']);

        let url = 'common/login';

        res.render(url, {
            path : "/"+url,
            endType : "",
            data : {},
            body : {},
            userData:{},
            cookie : req.cookies,
            redirect : req.query.redirect
        });
    }
});

router.post('/', function(req, res, next){
    let query = {
        code : req.body.username,
        password : req.body.password
    };

    UserService.findOne({}, query, 'role').then(data => {
        if(data == null){
            res.send(resUtil.error({
                message : "用户名或密码不正确"
            }));
        }else{
            if(data.role){
                MenuService.tree(data, '', {_id: {'$in': data.role.menus}}).then(menus => {
                    req.session.userData = {
                        _id : data._id,
                        name: data.name,
                        code: data.code,
                        org: data.org,
                        role : data.role,
                        tenant : data.tenant,
                        menu : menus
                    };
                    logger.info(data.name, data.code, data);
                    res.send(resUtil.success({
                        message : "登陆成功"
                    }));
                });
            }else{
                req.session.userData = {
                    _id : data._id,
                    name: data.name,
                    code: data.code,
                    org: data.org,
                    role : data.role,
                    tenant : data.tenant,
                    menu : {rows:[]}
                };
                logger.info(data.name, data.code, data);
                res.send(resUtil.success({
                    message : "登陆成功"
                }));
            }
        }
    });
});

router.get('/logout', function(req, res, next){
    req.session.destroy(function(err) {
        res.redirect(global.config.path.contextPath + '/');
    });
});

module.exports = router;
