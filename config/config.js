/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved.
 */

module.exports = {
    title: 'Dolphin-Clean',
    mock : true,

    path : {
        projectPath: `${__dirname}/..`,
        hostname: "http://127.0.0.1:18080",
        contextPath : "",
        viewPrefix : "/view",
        publicPath : "",
        uploadPath: './public/uploadFile/',
        mode : ""
    }
    // path : {
    //     hostname: "http://127.0.0.1:18080",
    //     contextPath : "/weum",
    //     viewPrefix : "/view",
    //     publicPath : "/static-weum",
    //     uploadPath: '/home/wang/app/Wechat_um/wum/public/uploadFile/',
    //     mode : ""
    // }
    ,api : {
        serverUrl : 'http://127.0.0.1:3130',
        filePath : '/../../config/apiConfig.json'
    }
    ,session : {
        secret: "keyboard cat",
        name: "fengqi",                                //这里的name值得是cookie的name，默认cookie的name是：connect.sid
        cookie: {"maxAge": 1800000 },                     //设置maxAge是1800000ms，即30min后session和相应的cookie失效过期
        resave: false,
        saveUninitialized: true
    }

    ,i18n : {
        locales: ['en', 'zh'],
        directory: 'config/locales',
        defaultLocale : 'zh'
    }

    ,db : {
        host : '127.0.0.1',
        // host : 'gy.rechange.cn',
        port : '27017',
        database : "FENGQI",
        username : 'fengqi',
        password : 'fengqi123',
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
