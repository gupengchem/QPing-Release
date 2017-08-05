'use strict';
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const log4js = require('log4js');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const xmlParser = require('express-xml-bodyparser');

const session = require('express-session');
const FileStore = require('session-file-store')(session);
const extend = require('extend');
const i18n = require('i18n');
const fs = require('fs');

//config
console.log("/------------------------ 系统配置信息 ------------------------/");
global.config = require(path.join(__dirname, 'config/config'));
console.log(global.config);
console.log("///////////////////////// 系统配置信息 /////////////////////////");
log4js.configure(global.config.log);
let logger = log4js.getLogger("sys");
global.tool = require(path.join(__dirname, 'module/util/tool'));

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('case sensitive routing', true);    //路径是否忽略大小写
app.set('strict routing', true);            //
app.set('trust proxy', true);               //

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(log4js.connectLogger(logger, {level:'info', format:':method | :status | :response-time ms | :url '}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(xmlParser({}));

app.use(cookieParser());
// app.use(session(global.config.session));
app.use(session(extend({},                  //session写文件
    global.config.session,
    {
        store : new FileStore({
            path: path.join(__dirname, 'log/sessions')
        })
    })
    )
);

logger.debug('/--------------------- init i18n -------------------/');
global.config.i18n.directory = path.join(__dirname, global.config.i18n.directory);
i18n.configure(global.config.i18n);
app.use(i18n.init);
global.tool.traversalFolderSync(path.join(__dirname, 'config/locales'), {
    eachFile : function (_path, pathArr, level) {
        let data = fs.readFileSync(_path, 'utf8');
        fs.writeFileSync(path.join(__dirname, 'public/locales', pathArr[level].replace('.json', '.js')), "Dolphin.i18n.addMessages(" + data + ');');
        logger.debug(_path);
    }
});
logger.debug('////////////////////// init i18n ////////////////////');

logger.debug('/----------------------- routes ---------------------/');
global.tool.traversalFolderSync(path.join(__dirname, 'routes'), {
    eachFile : function (path, pathArr, level) {
        let url = pathArr.join('/').replace('.js', '');
        url = url.replace(/(\/?)(\d+)_/g, '$1');
        switch (url){               //在这里可以有一些特殊处理
            case "index":
                url = ''; break;
        }
        logger.info(url, path);
        if(url.indexOf(".DS_Store")<0){
            app.use('/'+url, require(path));
        }
    }
});
logger.debug('///////////////////////// routes //////////////////////');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    // res.status(err.status || 500);
    // res.render('common/error');
    if (err.status == 404 || err.message.indexOf('Failed to lookup view') > -1) {
        res.render('common/notFound', {
            message: err.message,
            error: err
        });
    } else if (err.status == 401) {
        res.render(req.session.endType + '/forbid', {
            message: err.message,
            error: err
        });
    } else {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    }
});

global.cache = {};
logger.debug('/----------------------- init cache ---------------------/');
global.cache.qrCode = {};
logger.debug('///////////////////////// cache //////////////////////');

logger.debug('/----------------------- Init Data ---------------------/');
const InitDbData = require('./module/util/initDbData');
InitDbData.init();
logger.debug('///////////////////////// Init Data //////////////////////');

module.exports = app;
