/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved. 
 */
"use strict";
const fs = require('fs');
const logger = global.log4js.getLogger('default');

/**
 * 如果我们使用KONG（https://getkong.org/）的话，则此处的映射可以关闭掉。
 * 在init的时候，从kong上load出api的映射关系
 */
module.exports = (function () {
    /**
     * 出口的值
     * @type {{_data: {}, init: apiRoute.init, register: apiRoute.register, get: apiRoute.get, listen: apiRoute.listen, apiAuthentication: apiRoute.apiAuthentication}}
     */
    const apiRoute = {

        _data: {},

        /**
         * api文件
         */
        _apiFile: __dirname + global.config.apiFilePath,

        /**
         * 初始化api列表
         * @returns {exports}
         */
        init: function () {
            //TODO: 我们需要加判断，如果有Kong存在的话，则不需要listen，直接从api gateway 空上下载api对应关系
            this.loadAll();
            this.listen();
            logger.info('init the api gate way!');
            return this;
        },

        /**
         * 注册某个api
         * @param api
         */
        register: function (api) {
            this._data[global.tool.uuid()] = api;
            //TODO: flush into filesystem
        },

        /**
         * 根据uuid获取api接口
         * @param uuid
         * @returns {*}
         */
        get: function (uuid) {
            return global.config.apiServerUrl+this._data[uuid];
        },

        /**
         * 加载所有的配置
         */
        loadAll: function () {
            let me = this;
            fs.readFile(this._apiFile, "utf-8", function (error, context) {
                logger.info("api config update", context);
                me._data = JSON.parse(context);
            });
        },

        /**
         * 监听文件变化
         */
        listen: function () {
            let me = this;
            fs.watchFile(me._apiFile, {
                interval : 60000
            }, function (curStat, preStat) {
                me.loadAll();
            });
        },

        /**
         * API接口调用的安全认证
         * @param req
         * @param res
         * @param next
         */
        apiAuthentication: function (req, res, next) {
            console.info('auth::apiAuthentication');
            if (!req.session.userData) {
                res.json({success: false, msg: '登录已过期，请重新登录'})
            } else {
                //判断从浏览器头部传输过来的token或者session是否有效
                //?或者从cookie中获取？
                //确认权限
                next();
            }
        }
    };
    apiRoute.init();
    return apiRoute;
})();
