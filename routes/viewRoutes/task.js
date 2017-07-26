/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved.
 */
"use strict";
let api = require('../../utils/api');

module.exports = {

    todo: function (req, res, callback) {
        global.tool.send({
            method: 'post',
            uri: api.get('a95f7a0ee3944c09bec8099c7b4c85bc'),
            json: {
                properties: {
                    pageSize: 999999,
                    assignee: req.session.userData.userCode
                }
            }
        }, function (error, response, body) {
            callback(body || {
                    rows: [],
                    total: 0
                });
        });
    },
    taskDetail:function (req, res, callback) {
        console.log(api.get('72f9180957e9431083a4442fea61bb21').replace("{id}", req.query.id),'+++++++++++++');
        global.tool.send({
            method: 'get',
            uri: api.get('72f9180957e9431083a4442fea61bb21').replace("{id}", req.query.id)
        }, function (error, response, body) {
            let data = (body && body.value) || {success: false};
            data.success = body.success;
            data.editable = req.query.editable != 'false';
            data.save = req.query.save == 'true';
            callback(data);
        });
    }
};