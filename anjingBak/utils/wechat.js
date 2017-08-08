const request = require('request');
const extend = require('extend');
const md5 = require('md5');
const js2xmlparser = require("js2xmlparser");
const xml2json = require('basic-xml2json');

const weChatUtil = {
    open_id_url: 'https://api.weixin.qq.com/sns/oauth2/access_token',
    token_url: 'https://api.weixin.qq.com/cgi-bin/token',
    user_info_url: 'https://api.weixin.qq.com/cgi-bin/user/info',
    message_url: 'https://api.weixin.qq.com/cgi-bin/message/template/send',
    preorder_url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
    payment_url: 'https://api.mch.weixin.qq.com/pay/downloadbill',
    group_url: 'https://api.weixin.qq.com/cgi-bin/groups',
    ticket_url: 'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
    config: {
        appid: 'wxf3e1063abaf889ab',
        mch_id: '1426008302',
        secret: '511e4629bb152201fe939e1665d132c7',
        key: 'hzklppglyxgskywlwkjyxgszhwftdbz0',
        mine:{
        }
    },
    tokenTime: 7000000, //jsapi_ticket的有效期为7200秒，我们在这里提前2s
    tokenCache: {
        tokenId: 'tokenId',
        tokenTime: 0
    },
    ticketCache: {
        ticketId: 'ticketId',
        ticketTime: 0
    }
};

/**
 * 根据code获取openid
 * @param code
 * @param callback
 */
weChatUtil.getOpenId = function (code, callback) {
    let _this = this;
    request({
        method: 'get',
        uri: _this.open_id_url + "?appid=" + _this.config.appid + "&secret=" + _this.config.secret + "&code=" + code + "&grant_type=authorization_code"
    }, function (error, response, body) {
        if (error) {
            callback("unknownOpenid");
            return;
        }
        console.log("weChatUtil.getOpenId by code:@" + body + "@");
        let retData = JSON.parse(body);
        if (retData.openid) {
            callback(retData.openid);
        } else {
            console.log("fetch openId error!");
            callback('fetch-openid-error');
        }
    });
};

weChatUtil.getToken = function (callback) {
    let _this = this;
    let n = new Date().getTime();
    if (n - _this.tokenCache.tokenTime > _this.tokenTime) {
        console.log("fetch new token id:", n, _this.tokenCache.tokenTime, _this.tokenTime);
        _this._getToken(function (token) {
            _this.tokenCache.tokenId = token;
            _this.tokenCache.tokenTime = n;
            callback(token);
        });
    } else {
        callback(_this.tokenCache.tokenId);
    }
};

/**
 * 获取token
 * @param callback
 */
weChatUtil._getToken = function (callback) {
    let _this = this;
    request({
        method: 'get',
        uri: _this.token_url + "?appid=" + _this.config.appid + "&secret=" + _this.config.secret + "&grant_type=client_credential"
    }, function (error, response, body) {
        if (error) {
            callback("000000");
            return;
        }
        console.log("weChatUtil.getToken:@" + body + "@");
        let retData = JSON.parse(body);
        if (retData.access_token) {
            callback(retData.access_token);
        } else {
            console.log("fetch token error!");
        }
    });
};

/**
 * 获取微信用户的基本信息
 * @param openId
 * @param calback
 */
weChatUtil.getUserInfo = function (openId, calback) {
    let _this = this;
    _this.getToken(function (tokenId) {
        request({
            method: 'get',
            uri: _this.user_info_url + "?access_token=" + tokenId + "&openid=" + openId + "&lang=zh_CN"
        }, function (error, response, body) {
            if (error) {
                calback({openid: "unknownOpenid"});
                return;
            }
            console.log("weChatUtil.getUserInfo:@" + body + "@");
            let retData = {openid: openId};
            try {
                retData = JSON.parse(body);
                if (retData.errcode && retData.errcode == '40001') {
                    _this.tokenCache.tokenTime = 0;
                }
            } catch (e) {
                console.log(e, 'error.....');
            }
            calback(retData);
        });
    });
};

/**
 * 发送微信消息
 * @param message
 */
weChatUtil.templateMessage = function (message, callback) {
    let _this = this;
    //let message = {
    //    touser: "opkN1t-njzuumf7t2d3Xlw8sUg2U",//openid
    //    template_id: "UdFYzwb7GdGH25-kx69vkbz4wOBwHuWWjocmJF34HYM",//
    //    url: "www.baidu.com",
    //    topcolor: "#FF0000"
    //};
    //message.data = {
    //    title: {value: "aa", color: "#173177"},
    //    keyword1: {value: "aa", color: "#173177"},
    //    keyword2: {value: "aa", color: "#173177"},
    //    remark: {value: "aa", color: "#173177"}
    //}
    _this.getToken(function (tokenId) {
        request({
            method: 'post',
            uri: _this.message_url + "?access_token=" + tokenId,
            //form: message
            body: JSON.stringify(message),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }, function (error, response, body) {
            if (error) {
                console.log("templateMessage" + error);
            }
            console.log("weChatUtil.templateMessage:@" + body + "@");
            let retData = JSON.parse(body);
            if (retData.errcode === 40001) {
                _this.tokenCache.tokenTime = 0;
            }
            callback(body);
        });
    });

};

weChatUtil.getTicket = function (callback) {
    let _this = this;
    let n = new Date().getTime();
    if (n - _this.ticketCache.ticketTime > _this.tokenTime) {
        console.log("fetch new ticket id:", n, _this.ticketCache.ticketTime, _this.tokenTime);
        _this._getTicket(function (ticketId) {
            _this.ticketCache.ticketId = ticketId;
            _this.ticketCache.ticketTime = n;
            callback(ticketId);
        })
    } else {
        callback(_this.ticketCache.ticketId);
    }
};

weChatUtil._getTicket = function (callback) {
    let _this = this;
    _this.getToken(function (tokenId) {
        request({
            method: 'get',
            uri: _this.ticket_url + "?access_token=" + tokenId + "&type=jsapi"
        }, function (error, response, body) {
            if (error)
                throw error;
            console.log("weChatUtil.getTicket:@", body, "@");
            let retData = JSON.parse(body);
            if (retData.ticket) {
                callback(retData.ticket);
            } else {
                console.log("fetch ticket error!", _this.tokenCache.tokenTime, _this.tokenTime);
            }
        });
    });
};

weChatUtil.preOrder = function (obj, callback) {
    let _this = this;
    let params = {};
    params['appid'] = this.config[obj.siteId]['appid'] || this.config.appid;
    if (this.config[obj.siteId]['sub_appid'])
        params['sub_appid'] = this.config[obj.siteId]['sub_appid'];
    params['mch_id'] = this.config[obj.siteId]['mch_id'] || this.config.mch_id;
    if (this.config[obj.siteId]['sub_mch_id'])
        params['sub_mch_id'] = this.config[obj.siteId]['sub_mch_id'];
    params['device_info'] = 'WEB';
    params['nonce_str'] = obj.nonce_str;
    params['body'] = "科寓支付订单";
    params['out_trade_no'] = obj.nonce_str;
    params['total_fee'] = (obj.amount - 0) * 100;
    params['spbill_create_ip'] = obj.remoteIp;
    params['notify_url'] = 'http://weixin.sodexo-cn.com/verifyToken';
    params['trade_type'] = 'JSAPI';
    if (params['sub_appid'])
        params['sub_openid'] = obj.openid;
    else
        params['openid'] = obj.openid;

    let key = [];
    key.push("appid=" + params['appid']);
    key.push("body=" + params['body']);
    key.push("device_info=" + params['device_info']);
    key.push("mch_id=" + params['mch_id']);
    key.push("nonce_str=" + params['nonce_str']);
    key.push("notify_url=" + params['notify_url']);
    if (params['openid'])
        key.push("openid=" + params['openid']);
    key.push("out_trade_no=" + params['out_trade_no']);
    key.push("spbill_create_ip=" + params['spbill_create_ip']);
    if (params['sub_appid'])
        key.push("sub_appid=" + params['sub_appid']);
    if (params['sub_mch_id'])
        key.push("sub_mch_id=" + params['sub_mch_id']);
    if (params['sub_openid'])
        key.push("sub_openid=" + params['sub_openid']);
    key.push("total_fee=" + params['total_fee']);
    key.push("trade_type=" + params['trade_type']);
    let tmp = key.join("&") + "&key=" + (this.config[obj.siteId]['key'] || _this.config.key);
    console.log(tmp);
    let sign = md5(tmp);
    sign = sign.toUpperCase();
    params['sign'] = sign;
    let xml = js2xmlparser.parse("xml", params);
    console.log(xml);
    request({
        method: 'post',
        uri: _this.preorder_url,
        body: xml,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }, function (error, response, body) {
        if (error) {
            throw error;
        }
        console.log(body);
        let json = xml2json.parse(body);
        let children = json.root.children, ret = {};
        for (let i = 0; i < children.length; i++) {
            ret[children[i].name] = children[i].content;
        }
        ret.key = _this.config[obj.siteId]['key'] || _this.config.key;
        callback(ret);
        console.log("weChatUtil.unifiedorder:@", ret, "@");
    });
};
weChatUtil.paymentList = function (obj, callback) {
    let _this = this;
    let params = {};
    params['appid'] = obj.appid;
    params['mch_id'] = obj.mch_id;
    // params['device_info'] = 'WEB';
    params['nonce_str'] = obj.nonce_str;

    let yesterday = new Date(new Date().getTime() - 1000 * 60 * 60 * 24);
    params['bill_date'] = obj.date || `${yesterday.getFullYear()}${yesterday.getMonth()+1>9?yesterday.getMonth()+1:'0'+(yesterday.getMonth()+1)}${yesterday.getDate()}`;
    params['bill_type'] = 'ALL';

    let key = [];
    key.push("appid=" + params['appid']);
    key.push("bill_date=" + params['bill_date']);
    key.push("bill_type=" + params['bill_type']);
    key.push("mch_id=" + params['mch_id']);
    key.push("nonce_str=" + params['nonce_str']);
    let tmp = key.join("&") + "&key=" + obj.key;
    console.log(tmp);

    let sign = md5(tmp);
    sign = sign.toUpperCase();
    params['sign'] = sign;

    let xml = js2xmlparser.parse("xml", params);
    console.log(xml);

    request({
        method: 'post',
        uri: _this.payment_url,
        body: xml,
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    }, function (error, response, body) {
        if (error) {
            throw error;
        }
        if(body.indexOf('<xml>')>-1) {
            let json = xml2json.parse(body);
            let children = json.root.children, ret = {};
            for (let i = 0; i < children.length; i++) {
                ret[children[i].name] = children[i].content;
            }
            ret.key = obj.key;
            callback(ret);
            console.log("weChatUtil.paymentList:@", ret, "@");
        } else {
            // let content = body.split('\r\n');
            callback(body);
        }
    });
};

weChatUtil.updateGroup = function (type, data, callback) {
    let _this = this;
    _this.getToken(function (token) {
        request.post({
            url: _this.group_url + "/" + type + "?access_token=" + token,
            json: data
        }, function (err, httpResponse, body) {
            if (err) {
                console.error('add group failed:', err);
                return;
            }
            console.log("add group:", body);
            callback(body);
        });
    });
};

module.exports = weChatUtil;