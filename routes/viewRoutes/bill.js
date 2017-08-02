/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved.
 */
"use strict";
let api = require('../../utils/api');

module.exports = {

    dealdetail : function (req, res, callback) {
        global.tool.send({
            method: 'post',
            uri: api.get('826f7a47aa94482a9a0c6bc7b59fc931'),
            json: {
                properties: {
                }
            }
        }, function (error, response, body) {
            let data = (body && body.rows) || [];
            callback(data);
        });
    }

};