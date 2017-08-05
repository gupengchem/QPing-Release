var express = require('express');
var router = express.Router();
var request = require('request');
var extend = require('extend');

var formidable = require('formidable');
var fs = require('fs');


router.get('/menu', function (req, res, next) {
    global.weChatUtil.getMenu(function (menu) {
        res.send({
            success: true,
            value: menu
        });
    });
});
router.post('/menu', function (req, res, next) {
    var menuData = {"button": req.body};
    if(req.query.lang) {
        menuData.matchrule = {};
        menuData.matchrule.language = req.query.lang;
    }
    if(req.query.tagId) {
        menuData.matchrule = menuData.matchrule || {};
        menuData.matchrule.group_id = req.query.tagId;
    }
    global.weChatUtil.updateMenu(menuData, function (result) {
        res.send({
            success: (result.errcode === 0) ? true : false,
            msg: "errmsg:" + result.errmsg + ",errcode:" + result.errcode
        });
    });
});

router.post('/material/add_material', function (req, res, next) {
    console.log('upload wexin material');
    var form = new formidable.IncomingForm();   //创建上传表单
    form.encoding = 'utf-8';		//设置编辑
    //form.uploadDir = "\/home\/sodexho\/app\/media\/images\/";
    form.keepExtensions = true;	 //保留后缀
    form.maxFieldsSize = 5 * 1024 * 1024;   //文件大小

    var returnData = [];

    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log('error');
            return;
        }
        console.log(files);
        global.weChatUtil.materialUpload({type: 'image', file: files.media.path}, function (weData) {
            console.log(weData.media_id, weData.url);
            res.send(weData);
        });
    });
});

router.get('/material/list', function (req, res, next) {
    global.weChatUtil.materialList({type: req.query.type, offset: 0, count: 20}, function (weData) {
        res.send(extend({}, {success: true}, weData));
    });
});

router.post('/material/update_news', function (req, res, next) {
    console.log(req.body);
    global.weChatUtil.updateNews(req.query.type, req.body, function (weData) {
        res.send({success: true});
    });
});

router.get('/material/get_material', function (req, res, next) {
    global.weChatUtil.materialGet(req.query.mediaId, function (weData) {
        res.send({success: true, data: weData});
    });
});

router.get('/material/delete_material', function (req, res, next) {
    global.weChatUtil.materialDelete(req.query.mediaId, function (weData) {
        res.send({success: true, data: weData});
    });
});

router.post('/groups/update', function (req, res, next) {
    console.log(req.body);
    var type = req.query.type;
    var data = req.body;
    global.weChatUtil.updateGroup(type, {"group": req.body}, function (weData) {
        console.log(weData);
        res.send({success: true, data: weData});
    });
});

router.post('/groups/members', function (req, res, next) {
    console.log(req.body);
    var data = req.body, groups = data['groups'];
    for (var i = 0; i < groups.length; i++) {
        global.weChatUtil.updateGroup("members/update", {
            openid: data.openid,
            to_groupid: groups[i]
        }, function (weData) {

        });
    }
    res.send({success: true});
});

router.post('/preview-message', function (req, res, next) {
    global.weChatUtil.previewMessage(req.body, function (weData) {
        res.send({success: true});
    });
});

router.post('/mass-send', function (req, res, next) {
    global.weChatUtil.massMessage(req.body, function (weData) {
        res.send({success: true});
    });
});

module.exports = router;
