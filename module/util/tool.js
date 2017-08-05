'use strict';
const request = require('request');
const extend = require('extend');
const uuid = require('uuid');
const fs = require('fs');

const myUtil = {
    endTypeEnum: {
        desktop: 1,
        mobile: 3,
        pad: 5
    }
};

myUtil.send = function (param, callback) {
    let data;
    if(global.config.mock){
        //TODO: mock框架的优化
        try{
            data = require(`../mockService${param.uri.substr(0, param.uri.indexOf('?'))}_${param.method}.js`);
            callback(null, null, data);
        }catch(e){
            callback(e, null, data);
        }
    }else{
        let defaultParam = {
            json : {},
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Accept-Language": param.language || "zh"
            }
        };
        let _param = extend(true, {}, defaultParam, param);
        request(_param, callback);
    }
};

/**
 * 深度合并对象
 * @param defaultParam
 * @param myParam
 */
myUtil.extend = function (defaultParam, myParam) {
    return extend(true, {}, defaultParam, myParam);
};

myUtil.isToday = function (date) {
    let today = new Date();
    let todayTime = today.getTime() - today.getTime()%(1000*60*60*24);
    let dateTime = date.getTime();
    if(dateTime > todayTime && dateTime < (todayTime+(1000*60*60*24))){
        return true;
    }else{
        return false;
    }
};

myUtil.addLength = function(str, length){
    let newStr = str+"";
    while (newStr.length < length){
        newStr = "0"+newStr;
    }
    return newStr;
};

/**
 * 日期格式化
 * @param date 日期
 * @param format 格式
 * @returns {*} 格式化后的字符串值
 */
myUtil.dateFormatter = function (date, format) {
    let o = {
        "M+" : date.getMonth() + 1, //month
        "d+" : date.getDate(),      //day
        "h+" : date.getHours(),     //hour
        "m+" : date.getMinutes(),   //minute
        "s+" : date.getSeconds(),   //second
        "w+" : "天一二三四五六".charAt(date.getDay()),   //week
        "q+" : Math.floor((date.getMonth() + 3) / 3),  //quarter
        "S"  : date.getMilliseconds() //millisecond
    };
    if(/(y+)/.test(format)) {
        format = format.replace(RegExp.$1,
            (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for(let k in o){
        if(new RegExp("("+ k +")").test(format)){
            format = format.replace(RegExp.$1,
                RegExp.$1.length == 1 ? o[k] :
                    ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return format;
};

/**
 * 客户信息的获取
 * @param url
 * @param callback
 */
myUtil.customerInfo = function(url, callback) {
    request({
        method: 'get',
        //uri: global.config.service['crm']+'/user/code/'+openId,
        uri: url,
        json: {},
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    }, function (error, response, body) {
        //判断body
        let userData = {userType:'public'};
        if(body && body.id > 0){
            userData.userType = body.type;
            userData.siteId = body.company;
            userData.userId = body.id;
            userData.userCode = body.code;
            userData.userName = body.name;
            userData.userMobile = body.phone;
            userData.addressCount = body.addressCount;
            userData.userJob = body.userJob;
            if(body.defaultAddress) {
                userData.defaultAddress = body.defaultAddress;
            }
        }
        callback(userData);
    });
};

myUtil.traversalFolderSync = function(folder, param, path, level){
    level = level || 0;
    path = path || [];
    let files = fs.readdirSync(folder);
    files.forEach(function (f, i) {
        path[level] = f;
        let FilePath = folder + '/' + f;
        if(fs.statSync(FilePath).isFile()){
            if(typeof param.each == 'function'){
                param.each('file', FilePath, path, level);
            }
            if(typeof param.eachFile == 'function'){
                param.eachFile(FilePath, path, level);
            }
        }else{
            if(typeof param.each == 'function'){
                param.each('folder', FilePath, path, level);
            }
            if(typeof param.eachFolder == 'function'){
                param.eachFolder(FilePath, path, level);
            }
            myUtil.traversalFolderSync(FilePath, param, path.concat(), level+1);
        }
    });
    path.shift();
};

myUtil.escape2Html = function(str) {
    let arrEntities={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"'};
    return str.replace(/&(lt|gt|nbsp|amp|quot);/ig,function(all,t){return arrEntities[t];});
};

/**
 * 在指定字符前面补0，以达到指定的长度
 * @param str 需要补0的字符串
 * @param length 需要达到的长度
 * @returns {string} 补0后的字符串
 */
myUtil.padZero = function (str, length) {
    let newStr = str + "";
    while (newStr.length < length) {
        newStr = "0" + newStr;
    }
    return newStr;
};

/**
 * 获取请求端的类型
 * @param str
 * @returns {string}
 */
myUtil.endType = function (str) {
    return /mobile|Mobile/.test(str) ? "mobile" : "desktop";
};

/**
 * 获取随机串
 */
myUtil.uuid = function () {
    return uuid.v4();
};

/**
 * 替换url上的变量
 */
myUtil.setPathData = function (url, data) {
    let key;
    for(key in data){
        url = url.replace('{' + key + '}', data[key]);
    }
    return url;
};



module.exports = myUtil;