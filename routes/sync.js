"use strict";
const router = require('express').Router();
const request = require('request');
const api = require('../utils/api');
const weChat = require('../utils/wechat');
const path = require('path');
const Alipay = require('alipay-node-sdk');
const fs = require('fs');
const unzip = require('cross-unzip');
const iconv = require('iconv-lite');
const BufferHelper = require('bufferhelper');

router.use('/', function (req, res, next) {
    let customerId = req.body.customerId,
        daterange = req.body.daterange,
        startDate = daterange.substr(0, 8),
        endDate = daterange.substr(11),
        aliStartDate = daterange.substr(0, 4) + '-' + daterange.substr(4, 2) + '-' + daterange.substr(6, 2);
    console.log(startDate, endDate);
    global.tool.send({
        method: 'get',
        uri: api.get('a9712abc45444611a652bf9b14ebd59e') + customerId
    }, function (error, response, body) {
        if (body && body.rows) {
            for (let i = 0; i < body.rows.length; i++) {
                if (body.rows[i].type == 'wepay') {
                    weChat.paymentList({
                        appid: body.rows[i].appId,
                        mch_id: body.rows[i].name,
                        key: body.rows[i].code,
                        nonce_str: "a" + new Date().getTime(),
                        date: startDate
                    }, data => {
                        global.tool.send({
                            method: 'post',
                            uri: api.get('ca85d60b8f1d4d23aa073be9c6dede7a'),
                            json: {
                                content: data,
                                type: 'wepay',
                                customerId: customerId
                            }
                        }, function (error, response, body) {
                        });
                    });
                } else if (body.rows[i].type == 'alipay') {
                    console.log(body.rows[i].code);
                    new Alipay({
                        appId: body.rows[i].code,
                        notifyUrl: 'http://www.iobox.me/callback/alipay',
                        rsaPrivate: path.resolve(global.config.alipayRasFilePath + body.rows[i].secret),
                        // rsaPrivate: path.resolve('D:\\data\\' + body.rows[i].secret),
                        rsaPublic: path.resolve(global.config.alipayRasFilePath + body.rows[i].rsaKey),
                        // rsaPublic: path.resolve('D:\\data\\' + body.rows[i].rsaKey),
                        sandbox: false,
                        signType: 'RSA'
                    }).billDownloadUrlQuery({
                        billType: 'trade',
                        billDate: aliStartDate
                    }).then(function (ret) {
                        let data = JSON.parse(ret.body);
                        if (data &&
                            data.alipay_data_dataservice_bill_downloadurl_query_response
                            && data.alipay_data_dataservice_bill_downloadurl_query_response.bill_download_url) {
                            let tm = new Date().getTime(), fnPath = global.config.alipayDownloadPath + tm,
                                fn = fnPath + '.csv.zip';
                            request(data.alipay_data_dataservice_bill_downloadurl_query_response.bill_download_url)
                                .pipe(fs.createWriteStream(fn))
                                .on('close', function () {
                                    console.log(fn + '下载完毕');
                                    // fs.createReadStream(fn).pipe(unzip.Extract({path: global.config.alipayDownloadPath}));
                                    unzip(fn, fnPath, err => {
                                        if (err === null) {
                                            fs.unlinkSync(fn);
                                            console.log('exit');
                                            fs.readdir(fnPath, function (err, files) {
                                                if (err) {
                                                    console.log(err);
                                                    return;
                                                }
                                                files.forEach(function (file) {
                                                    if (file.indexOf('汇总') > -1) {
                                                        console.log('++++++++++++汇总');
                                                    } else {
                                                        let bufferHelper = new BufferHelper();
                                                        fs.createReadStream(fnPath + '/' + file)
                                                            .on('data', function (chunk) {
                                                                bufferHelper.concat(chunk);
                                                            })
                                                            .on('end', function () {
                                                                let con = iconv.decode(bufferHelper.toBuffer(), 'GBK');
                                                                console.log(con.split('\r\n'));
                                                                global.tool.send({
                                                                    method: 'post',
                                                                    uri: api.get('ca85d60b8f1d4d23aa073be9c6dede7a'),
                                                                    json: {
                                                                        content: con,
                                                                        type: 'alipay',
                                                                        customerId: customerId
                                                                    }
                                                                }, function (error, response, body) {
                                                                });
                                                            });
                                                    }
                                                });
                                            });
                                        }
                                    });
                                });
                        }
                    });
                }
            }
            res.json({success: true, msg: '正在同步数据，关闭此弹框后，请稍候刷新页面'});
        } else {
            res.json({success: false, msg: '无商户号配置'});
        }
    });

});

module.exports = router;