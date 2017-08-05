(function($) {
	var DOLPHIN = {};
	var thisTool = DOLPHIN;

	// 基础配置
	DOLPHIN.defaults =  {
		ajax : {
			param : {
				type : 'get',
				dataType : "json",
				data : {},
				contentType : "application/json; charset=UTF-8",
				async : true,
				cache : false,
				loading : false,
				mockPathData : null
			},
			requestHeader : {},
			formatterRequestData : null,
            originalPath : "/data",
			mockPath : "/mockData",
			returnMsgKey : 'returnMsg'
		},
		compare : function(a, b){
			return a == b;
		},

		array : {
			separator : ',',
			formatter : null
		},
		date : {
			dateFormat : 'yyyy-MM-dd',
			dateTimeFormat : 'yyyy-MM-dd hh:mm:ss'
		},

		modalWin : {
			title : '系统提示',
			content : null,
			footer : null,

			defaultHidden : false,

			//event
			init : null,
			hide : null,
			hidden : null
		},
		alert : {
			width : '300px',
			title : '系统提示',
			countDownFlag : true,
			countDownTime : 3
		},
		confirm : {
			width : '300px',
			title : '系统提示'
		},
		prompt : {
			width : '300px',
			title : '系统提示',
			mustFlag : false,

			type : 'text',

			placeholder : '',
			defaultValue : '',

			items : null,															//type = radio, checkbox, select,
			idField : 'code',
			textField : 'name'
		},
		img : {
			mockPath : "/public/mockImg",
			param : {
				prefixPath : "/public/mockImg",
				suffixPath : ".png",
				style : {}
			}
		},
		url : {
			viewPrefix : ""
		},
		mockFlag : false
	};
	DOLPHIN.template = {};

	// 浏览器信息
	DOLPHIN.browser = function() {
		var browser = {
			appName : 'unknown',
			version : 0,
			isMobile : false,
			msIe : false,
			firefox : false,
			opera : false,
			safari : false,
			chrome : false,
			netscape : false
		};
		var userAgent = window.navigator.userAgent;
		if (/(msie|firefox|opera|chrome|netscape)\D+(\d[\d.]*)/.test(userAgent.toLowerCase())) {
			browser[RegExp.$1] = true;
			browser.appname = RegExp.$1;
			browser.version = RegExp.$2;
		} else if (/version\D+(\d[\d.]*).*safari/.test(userAgent.toLowerCase())) { // safari
			browser.safari = true;
			browser.appname = 'safari';
			browser.version = RegExp.$2;
		}

		browser.ismobile = /mobile|Mobile/.test(userAgent);
		browser.language = navigator.language;

		return browser;
	}();

	// 常用路径
	DOLPHIN.path = (function(){
		var obj = {},key;
		for(key in location){
			if(typeof location[key] !== 'function'){
				obj[key] = location[key];
			}
		}
		var pathname = obj.pathname.split('/');
		obj.contextPath = "/" + pathname[1];

		return obj;
	})();

	//常用变量
	DOLPHIN.requestMethod = {
		GET : "get",
		POST : "post",
		PUT : "put",
		DELETE : "delete"
	};

	//数据操作
	DOLPHIN.emptyObj = function (data) {
		for(var key in data){
			delete data[key];
		}
		return data;
	};
	DOLPHIN.isPrime = function(i) {
		var ones = "";
		while(--i >= 0) ones += "1";
		return !/^1?$|^(11+?)\1+$/.test(ones);
	};
	DOLPHIN.isInt = function(num){
		return num == parseInt(num);
	};
	DOLPHIN.isNumber = function(num){
		return num == parseFloat(num);
	};
	DOLPHIN.isPositiveNumber = function(num, flag){
		return (num > 0 || (!flag && num == 0));
	};
	DOLPHIN.compareDate = function(date1, date2){
		return date1.getTime() - date2.getTime();
	};
	DOLPHIN.urlAddParam = function(url, params){  //TODO
		var newUrl = url,key;
		switch (this.typeof(params)){
			case "array":
				for(var i = 0; i < params.length; i++){
					newUrl = this.urlAddParam(newUrl, params[i]);
				}
				break;
			case "object":
				for(key in params){
					newUrl += (newUrl.indexOf('?') > 0 ? "&" : "?");
					newUrl += key + "=" + params[key] ;
				}
				break;
			default :
		}
		return newUrl;
	};
	DOLPHIN.typeof = function(obj){
		var type;
		switch (typeof obj){
			case "object":
				if($.isArray(obj)){
					type = "array";
				}else if(obj === null){
					type = "null";
				}else{
					type = "object";
				}
				break;
			default:
				type = typeof obj;
		}

		return type;

	};
	DOLPHIN.objInArray = function(o, a, func){
		var check = func || this.defaults.compare;

		for(var i = 0; i < a.length; i++){
			if(check(o, a[i])){
				return true;
			}
		}
		return false;
	};
	DOLPHIN.objIndexOfArray = function(o, a, func){
		var check = func || this.defaults.compare;

		for(var i = 0; i < a.length; i++){
			if(check(o, a[i])){
				return i;
			}
		}
		return -1;
	};
	DOLPHIN.dateDifference = function (date1, date2) {
		var difference = [], timeDifference, differenceText,
			differenceUnit = ['毫秒', '秒', '分钟', '小时', '天'],
			divisorArr = [1000, 60, 60, 24],
			level = 0, i;
		try{
			timeDifference = Math.abs(date1.getTime() - date2.getTime());

			if(timeDifference == 0){
				differenceText = 0;
			}else{
				differenceText = "";
				while(timeDifference > 0 && level < divisorArr.length){
					difference.push(timeDifference % divisorArr[level]);
					timeDifference = Math.floor(timeDifference / divisorArr[level]);
					level++;
				}
				if(timeDifference > 0){
					difference.push(timeDifference);
				}

				for(i = 0; i < difference.length; i++){
					differenceText = difference[i] + differenceUnit[i] + differenceText;
				}
			}
		}catch(e){
			console.log(e);
			return differenceText;
		}

		return differenceText;
	};

	//数据间转换
	//string <--> array
	DOLPHIN.splitString = function(string, param){ //TODO
		var opts = $.extend({}, this.defaults.array, param);
		var data = string.split(opts.separator);
		if(typeof opts.formatter == 'function'){
			for(var i = 0; i < data.length; i++){
				data[i] = opts.formatter(data[i], data);
			}
		}

		return data;
	};
	DOLPHIN.joinArray = function(array, param){  //TODO
		var opts = $.extend({}, this.defaults.array, param);
		var string = "";
		if(typeof opts.formatter == 'function'){
			for(var i = 0; i < array.length; i++){
				if(i != 0){
					string += opts.separator;
				}
				string += opts.formatter(array[i]);
			}
		}else{
			string = array.join(opts.separator);
		}
		return string;
	};
	//json <--> string
	DOLPHIN.string2json = function(str){
		var o = null;
		try{
			o = jQuery.parseJSON(str);
		}catch(e){
			console.warn(e);
			o = str;
		}
		return o;
	};
	DOLPHIN.json2string = function(json, quote){
		try{
			if(quote == "single"){
				return JSON.stringify(json).replace(/\"/g,"\\\'");
			}else if(quote == "double"){
				return JSON.stringify(json).replace(/\"/g,"\\\"");
			}else{
				return JSON.stringify(json);
			}
		}catch(e){
			console.warn(e);
			return json;
		}
	};

	//date
	DOLPHIN.string2date = function(string, format){
		format = format || thisTool.defaults.date.dateFormat;
		var y = string.substring(format.indexOf('y'),format.lastIndexOf('y')+1);//年
		var M = string.substring(format.indexOf('M'),format.lastIndexOf('M')+1);//月
		var d = string.substring(format.indexOf('d'),format.lastIndexOf('d')+1);//日
		var h = string.substring(format.indexOf('h'),format.lastIndexOf('h')+1);//时
		var m = string.substring(format.indexOf('m'),format.lastIndexOf('m')+1);//分
		var s = string.substring(format.indexOf('s'),format.lastIndexOf('s')+1);//秒

		if(s == null ||s == "" || isNaN(s)) {s = new Date().getSeconds();}
		if(m == null ||m == "" || isNaN(m)) {m = new Date().getMinutes();}
		if(h == null ||h == "" || isNaN(h)) {h = new Date().getHours();}
		if(d == null ||d == "" || isNaN(d)) {d = new Date().getDate();}
		if(M == null ||M == "" || isNaN(M)) {M = new Date().getMonth()+1;}
		if(y == null ||y == "" || isNaN(y)) {y = new Date().getFullYear();}
		var dt = null ;
		eval ("dt = new Date('"+ y+"', '"+(M-1)+"','"+ d+"','"+ h+"','"+ m+"','"+ s +"')");
		return dt;
	};
	DOLPHIN.date2string = function(date, format){
		format = format || thisTool.defaults.date.dateFormat;
		var o = {
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
		for(var k in o){
			if(new RegExp("("+ k +")").test(format)){
				format = format.replace(RegExp.$1,
					RegExp.$1.length == 1 ? o[k] :
						("00" + o[k]).substr(("" + o[k]).length));
			}
		}
		return format;
	};
	DOLPHIN.longDate2string = function(long, format){
		if(long) {
			var date = new Date(long);
			return this.date2string(date, format);
		} else {
			return "";
		}
	};
	DOLPHIN.jsonDate2string = function(json, format){
		var jsonObj = null;
		var jsonStr = null;
		var date = null;

		if(typeof json == "string"){
			jsonStr = json;
			jsonObj = this.string2json(json);
		}else{
			jsonStr = this.json2string(json);
			jsonObj = json;
		}
		if(jsonObj && jsonObj.time){
			date = new Date(jsonObj.time);
			return this.date2string(date, format);
		}else{
			return this.i18n.get('core_jsonDate2string_error', jsonStr);
		}
	};

	/**
	 * 请求远程js文件
	 *
	 * @param url
	 * @return 无
	 */
	DOLPHIN.require = function (url) {
		var _u = Dolphin.path.contextPath + "/public" + Dolphin.systemConfig.pageScript +(Dolphin.browser.ismobile?"/mobile":"/desktop") + url + ".js";
		document.write('<script src="'+_u+'"></'+ 'script>');
	};

	//ajax
	DOLPHIN.ajax = function(param){//初始化数据  TODO 重构
		var _this = this;
		var return_data = null, opts, key;
		var defaultFunction = {
			success : function(reData, textStatus){
				return_data = reData;
				if(reData.success){
					if(typeof param.onSuccess === 'function'){
						param.onSuccess(reData, textStatus);
					}
				}else{
					thisTool.alert(reData[thisTool.defaults.ajax.returnMsgKey]
						|| thisTool.i18n.get('core_ajax_error'), {
						countDownFlag:false,
						callback : function(){
							if(typeof param.onError === 'function'){
								param.onError(reData);
							}
						}
					});
				}
			},
			error : function(XMLHttpRequest, textStatus, errorThrown){
				if(textStatus == "parsererror" && XMLHttpRequest.status == 200){
					return_data = XMLHttpRequest.responseText;
				}else if(XMLHttpRequest.status == 500){
					thisTool.alert(textStatus + "<br/>" + XMLHttpRequest.status + "<br/>" + XMLHttpRequest.responseText, {
						countDownFlag:false
					});
				}else if(XMLHttpRequest.status == 403){
					thisTool.alert(thisTool.i18n.get('core_login_timeout') + '<br/>' + '<a href=".">'+thisTool.i18n.get('core_reLogin')+'</a>', {
						countDownFlag:false
					});
				}else if(XMLHttpRequest.status == 404){
					thisTool.alert(textStatus + "<br/>" + XMLHttpRequest.status + "<br/>"+this.url, {
						countDownFlag:false
					});
					return_data = textStatus;
					if(typeof param.onError === 'function'){
						param.onError(textStatus);
					}
				}else{
					thisTool.alert(textStatus + "<br/>" + XMLHttpRequest.status, {
						countDownFlag:false
					});
					return_data = textStatus;
					if(typeof param.onError === 'function'){
						param.onError(textStatus);
					}
				}
			},
			beforeSend : function(XMLHttpRequest){
				if(typeof param.onBeforeSend === 'function'){
					param.onBeforeSend.call(thisTOOL, XMLHttpRequest);
				}
				if(param.loading){
					$('body > #loading').show();
				}

				var requestHeaderParam = $.extend({}, thisTool.defaults.ajax.requestHeader, param.requestHeader);
				for(var key in requestHeaderParam){
					XMLHttpRequest.setRequestHeader(key, requestHeaderParam[key]);
				}
			},
			complete : function (XMLHttpRequest, textStatus) {
				// this; 调用本次AJAX请求时传递的options参数
				if(typeof param.onComplete === 'function'){
					param.onComplete(XMLHttpRequest, textStatus);
				}

				if(param.loading){
					$('body > #loading').hide();
				}
			}
		};

		opts = $.extend({}, thisTool.defaults.ajax.param, defaultFunction, param);

		if(typeof thisTool.defaults.ajax.formatterRequestData === 'function'){
			opts.data = thisTool.defaults.ajax.formatterRequestData.call(thisTool, opts.data, opts);
		}

		if(typeof opts.formatterRequestData === 'function'){
			opts.data = opts.formatterRequestData.call(thisTool, opts.data, opts);
		}

		if(opts.pathData){
			for(key in opts.pathData){
				opts.url = opts.url.replace('{' + key + '}', opts.pathData[key]);
			}
		}

		if(thisTool.defaults.mockFlag && opts.url.indexOf(thisTool.defaults.ajax.originalPath+'/') >= 0){
			var mockType = "",urlArray, paramFlag = (opts.url.indexOf("?") > 0)?true:false,paramArray,i;
			opts.url = opts.url.replace(thisTool.defaults.ajax.originalPath, thisTool.defaults.ajax.mockPath);
			if(opts.mockPathData){
				if($.isArray(opts.mockPathData)){
				urlArray = opts.url.split("/");
				if(paramFlag){
					paramArray = urlArray[urlArray.length -1].split("?");
					urlArray[urlArray.length -1] = paramArray[0];
				}
				for(i = 1; i <= opts.mockPathData.length; i++){
					urlArray[urlArray.length - i] = opts.mockPathData[opts.mockPathData.length - i];
				}
				opts.url = urlArray.join("/");
				if(paramFlag){
					opts.url += "?" + paramArray[1];
				}
				}else if(typeof opts.mockPathData == "object"){
					for(key in opts.mockPathData){
						opts.url = opts.url.replace('{'+key+'}', opts.mockPathData[key]);
					}
				}
			}

			mockType = "_"+opts.type;

			if(paramFlag){
				opts.url = opts.url.replace("?", mockType+".json?");
			}else{
				opts.url += mockType+".json";
			}

			opts.type = "get";
		}

		if(!opts.forceUrl){
            var contextPathRegexp;
            if(thisTool.path.contextPath == "/"){
                contextPathRegexp = new RegExp("^/");
            }else{
                contextPathRegexp = new RegExp("^" + thisTool.path.contextPath + "/");
            }
			if(!contextPathRegexp.test(opts.url) && !/^http:\/\//.test(opts.url)){
				opts.url = thisTool.path.contextPath + opts.url;
			}
		}

		$.ajax(opts);
		return return_data;
	};

	//DOM
	DOLPHIN.modalWin = function(param){  //TODO
		var opts = $.extend({}, thisTool.defaults.modalWin, param);
		var modalWindow, modalDialog, modalContent, modalHeader, modalBody, modalFooter;
		modalWindow = $('<div class="modal fade">').appendTo('body');

		modalDialog = $('<div class="modal-dialog">').css({
			width : opts.width
		}).appendTo(modalWindow);
		modalContent = $('<div class="modal-content">').appendTo(modalDialog);

		modalHeader = $('<div class="modal-header">').appendTo(modalContent);
		$('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>').appendTo(modalHeader);
		$('<h4 class="modal-title">').html(opts.title).appendTo(modalHeader);

		modalBody = $('<div class="modal-body">').appendTo(modalContent);
		modalBody.append(opts.content);

		if(opts.footer){
			modalFooter = $('<div class="modal-footer">').appendTo(modalContent);
			modalFooter.append(opts.footer);
		}
		if(typeof opts.init === 'function'){
			opts.init.call(modalWindow);
		}

		if(typeof opts.show === 'function'){
			modalWindow.on('show.bs.modal', function (e) {
				opts.show.call(modalWindow);
			})
		}
		if(typeof opts.shown === 'function'){
			modalWindow.on('shown.bs.modal', function(){
				opts.shown.call(modalWindow);
			});
		}
		if(typeof opts.hide === 'function'){
			modalWindow.on('hide.bs.modal', function (e) {
				opts.hide.call(modalWindow);
			})
		}
		if(typeof opts.hidden === 'function'){
			modalWindow.on('hidden.bs.modal', function(){
				opts.hidden.call(modalWindow);
			});
		}
		if(opts.defaultHidden){
			modalWindow.modal('hide');
		}else{
			modalWindow.modal('show');
		}

		return modalWindow;
	};
	DOLPHIN.alert = function(info, param){	//TODO
		var _this = this;
		var opts = $.extend({}, thisTool.defaults.alert, param), countDownSpan;

		if(this.browser.isMobile){
			alert(info);
			if(typeof opts.callback == 'function'){
				opts.callback.call(this);
			}
			return false;
		}else{
            opts.content = info;

            if(opts.countDownFlag !== false){
                opts.footer = $('<div>');
                countDownSpan = $('<span class="countDown">').appendTo(opts.footer);
                countDownSpan.html(_this.i18n.get('core_alert_countDown', opts.countDownTime));

                opts.init = function(){
                    var countDownNum = opts.countDownTime,
                        modalWindow = this;
                    function countDown(){
                        var callee = arguments.callee;
                        if(countDownNum != 0){
                            countDownSpan.html(_this.i18n.get('core_alert_countDown', countDownNum));
                            countDownNum--;
                            setTimeout(function(){
                                callee();
                            }, 1000);
                        }else{
                            modalWindow.modal('hide');
                        }
                    }
                    countDown();
                }
            }

            if(typeof opts.callback == 'function'){
                opts.hide = function(){
					try{
                    	opts.callback.call(this);
					}catch (e){
						console.error(e);
					}
                };
            }

            opts.hidden = function () {
                this.remove();
            };

            return this.modalWin(opts);
		}
	};
	DOLPHIN.confirm = function(info, param){	//TODO
		var opts = $.extend({}, thisTool.defaults.confirm, param),
			flag = false, confirmButton, cancelButton, callback = opts.callback;

		opts.content = info;
		opts.footer = $('<div>');
		confirmButton = $('<button type="button" class="btn btn-primary btn-small">'+thisTool.i18n.get('core_confirm_yes')+'</button>').appendTo(opts.footer);
		cancelButton = $('<button type="button" class="btn btn-default btn-small" >'+thisTool.i18n.get('core_confirm_no')+'</button>').appendTo(opts.footer);
		opts.init = function () {
			var thisWin = this;
			confirmButton.click(function () {
				flag = true;
				thisWin.modal('hide');
			});
			cancelButton.click(function () {
				thisWin.modal('hide');
			});
		};

		if(typeof callback == 'function'){
			opts.hide = function(){
				callback.call(this, flag);
			};
		}
		opts.hidden = function () {
			this.remove();
		};

		return this.modalWin(opts);
	};
	/*
	 param:{width:'300px', title:'系统提示', callback:function(){}, type:'input', mustFlag:false
	 placeholder:'', defaultValue:'',
	 items:[{code:'', name:''},{code:'', name:''}]																//radio, checkbox, select
	 }
	 */
	DOLPHIN.prompt = function(info, param){	//TODO
		var opts = $.extend({}, thisTool.defaults.prompt, param),
			string = null, confirmButton, cancelButton, inputPanel, input, callback = opts.callback;

		opts.content = $('<div>');
		$('<div>').append(info).appendTo(opts.content);
		inputPanel = $('<div>').appendTo(opts.content);
		switch(opts.type){
			default :
				input = $('<input type="text" class="form-control" placeholder="'+opts.placeholder+'" value="'+opts.defaultValue+'">');
		}
		input.appendTo(inputPanel);
		function getResultData(){
			switch(opts.type){
				default :
					string = input.val();
			}
		}

		opts.footer = $('<div>');
		confirmButton = $('<button type="button" class="btn btn-primary btn-small">'+thisTool.i18n.get('core_prompt_ok')+'</button>').appendTo(opts.footer);
		cancelButton = $('<button type="button" class="btn btn-default btn-small" >'+thisTool.i18n.get('core_prompt_cancel')+'</button>').appendTo(opts.footer);

		opts.init = function () {
			var thisWin = this;
			input.focus();
			confirmButton.click(function () {
				getResultData();
				thisWin.modal('hide');
			});
			cancelButton.click(function () {
				thisWin.modal('hide');
			});
		};
		if(typeof callback == 'function'){
			opts.hide = function () {
				callback.call(this, string);
			}
		}
		opts.hidden = function () {
			this.remove();
		};

		return this.modalWin(opts);
	};
	DOLPHIN.toggleCheck = function(selecter, flag){
		selecter.each(function(){
			if(typeof flag === 'boolean'){
				this.checked = flag;
			}else{
				this.checked = !this.checked;
			}
			$(this).change();
		});
	};
	DOLPHIN.toggleEnable = function(selecter, flag){
		var _flag;
		selecter.each(function(){
			_flag = flag==null?!!$(this).attr('disabled'):flag;
			if(_flag){
				$(this).removeAttr('disabled');
			}else{
				$(this).attr('disabled', 'disabled');
			}
		});
	};

    DOLPHIN.randomInt = function(max, min){
        min = min || 0;
        return min + Math.round(Math.random() * (max - min));
    };
    DOLPHIN.random = function(length){
        var _Length = length || 6;
        var randomNumber = Math.round(Math.random() * Math.pow(10, _Length));
        var randomStr = randomNumber + "";
        if(randomStr.length < _Length){
            for(var i = 0; i < _Length - randomStr.length;){
                randomStr = "0" + randomStr;
            }
        }
        return randomStr;
    };

	//location
	DOLPHIN.goHistory = function(){  //TODO
		history.go(-1);
	};
	DOLPHIN.goUrl = function(url){
		if(url.indexOf("http://") != 0){
			url = this.path.contextPath + this.defaults.url.viewPrefix + url;
		}
		location.href = url;
	};

	//console
	DOLPHIN.console = null;

	//cookie
	/**
	 * Cookie plugin
	 *
	 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
	 * Dual licensed under the MIT and GPL licenses:
	 * http://www.opensource.org/licenses/mit-license.php
	 * http://www.gnu.org/licenses/gpl.html
	 *
	 */

	/**
	 * Create a cookie with the given name and value and other optional parameters.
	 *
	 * @example $.cookie('the_cookie', 'the_value');
	 * @desc Set the value of a cookie.
	 * @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
	 * @desc Create a cookie with all available options.
	 * @example $.cookie('the_cookie', 'the_value');
	 * @desc Create a session cookie.
	 * @example $.cookie('the_cookie', null);
	 * @desc Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
	 *       used when the cookie was set.
	 *
	 * @param String name The name of the cookie.
	 * @param String value The value of the cookie.
	 * @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
	 * @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
	 *                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
	 *                             If set to null or omitted, the cookie will be a session cookie and will not be retained
	 *                             when the the browser exits.
	 * @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
	 * @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
	 * @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
	 *                        require a secure protocol (like HTTPS).
	 * @type undefined
	 *
	 * @name $.cookie
	 * @cat Plugins/Cookie
	 * @author Klaus Hartl/klaus.hartl@stilbuero.de
	 */

	/**
	 * Get the value of a cookie with the given name.
	 *
	 * @example $.cookie('the_cookie');
	 * @desc Get the value of a cookie.
	 *
	 * @param String name The name of the cookie.
	 * @return The value of the cookie.
	 * @type String
	 *
	 * @name $.cookie
	 * @cat Plugins/Cookie
	 * @author Klaus Hartl/klaus.hartl@stilbuero.de
	 */
	DOLPHIN.cookie = function(name, value, options) {
		if (typeof value != 'undefined') { // name and value given, set cookie
			options = options || {};
			if (value === null) {
				value = '';
				options.expires = -1;
			}
			var expires = '';
			if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
				var date;
				if (typeof options.expires == 'number') {
					date = new Date();
					date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
				} else {
					date = options.expires;
				}
				expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
			}
			// CAUTION: Needed to parenthesize options.path and options.domain
			// in the following expressions, otherwise they evaluate to undefined
			// in the packed version for some reason...
			var path = options.path ? '; path=' + (options.path) : '';
			var domain = options.domain ? '; domain=' + (options.domain) : '';
			var secure = options.secure ? '; secure' : '';
			document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
		} else { // only name given, get cookie
			var cookieValue = null;
			if (document.cookie && document.cookie != '') {
				var cookies = document.cookie.split(';');
				for (var i = 0; i < cookies.length; i++) {
					var cookie = jQuery.trim(cookies[i]);
					// Does this cookie string begin with the name we want?
					if (cookie.substring(0, name.length + 1) == (name + '=')) {
						cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
		}
	};

	DOLPHIN.createImg = function (param) {
		var img = $('<img>'), src, opts = $.extend({}, this.defaults.img.param, param);
		if(this.defaults.mockFlag){
			src = this.path.contextPath + this.defaults.img.mockPath + (opts.url || (opts.id?("/" + opts.id):false) || "/null") + opts.suffixPath;
		}else{
			src = this.path.contextPath + opts.prefixPath + (opts.url || (opts.id?("/" + opts.id):false) || "/null.png");
		}
		img.attr("src", src);

		img.addClass(opts.css);
		img.css(opts.style);
		return img;
	};

	DOLPHIN.initLoadingPanel = function (panel) {
		var loading, progressPanel, progress, bar;
		loading = $('<div class="loading" id="loading">').appendTo(panel);
		progressPanel = $('<div class="progressPanel">').appendTo(loading);
		progress = $('<div class="progress">').appendTo(progressPanel);
		bar = $('<div class="progress-bar progress-bar-striped active"></div>').css('width', '100%').appendTo(progress);
		return loading;
	};
	$(function () {
		DOLPHIN.initLoadingPanel('body');
	});

	window.Dolphin = DOLPHIN;
	window.TOOL = DOLPHIN;
	$.Dolphin = DOLPHIN;
})(jQuery);