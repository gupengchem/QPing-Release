/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved.
 */
const path = require('path');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

module.exports = {
    title: '风起',
    mock : true,
    port : '18080',

    path : {
        projectPath: `${__dirname}/..`,
        hostname: "http://127.0.0.1:18080",
        contextPath : "",
        viewPrefix : "/view",
        publicPath : "",
        uploadPath: `${__dirname}/../public/uploadFiles`,
        publicUploadPath: '/uploadFiles',
        mode : ""
    }
    ,api : {
        serverUrl : 'http://127.0.0.1:3130',
        filePath : '/../../config/apiConfig.json'
    }
    ,session : {
        secret: "keyboard cat",
        name: "fengqi",                                //这里的name值得是cookie的name，默认cookie的name是：connect.sid
        cookie: {"maxAge": 1800000 },                  //设置maxAge是1800000ms，即30min后session和相应的cookie失效过期
        rolling: true,                                 //每次用户交互后，重新计算时间
        resave: false,
        saveUninitialized: true,
        store : new FileStore({
            path: path.join(__dirname, '../log/sessions')
        })
    }

    ,i18n : {
        locales: ['en', 'zh'],
        directory: 'config/locales',
        defaultLocale : 'zh'
    }

    ,db : {
        host : '127.0.0.1',
        port : '27017',
        database : "TEST",
        username : 'test',
        password : 'test123',
        options : {
            server: {
                auto_reconnect: true,
                poolSize: 10
            },
            useMongoClient: true,
        }
    }
    ,dbUser : {
        admin : {
            _id : "34bdca6e-7119-487f-8dc2-5ff2f951fa0a",
            name : "管理员",
            code : "admin",
            password : "admin123",
            role : "b8fa6284-6990-4798-84e6-2082fdbd4d3f",
            tenant : "33f0fe38-fcd1-4f11-8a55-1831821b38c5",
        },
        robot : {
            _id : "f07ffe71-7235-4231-8246-d64aaaadcc14",
            name : "系统自动",
            code : "system",
            password : "system123",
            role : "robot"
        }
    }

    ,log : {
        appenders: [
            { type: 'console', category: 'sys' },
            { type: 'dateFile', filename: __dirname + '/../log/login.log', pattern: "_yyyy-MM-dd", alwaysIncludePattern: false, category: 'login' }
        ],
        levels : {
            sys: 'debug',
            default: 'info',
            http: 'info',
            data: 'warn',
            login: 'warn'
        }
    }

    ,cdn : {
        path : "//cdn.bootcss.com"              //boot cdn
        // path : "/libs"                        //locale
    }
};
