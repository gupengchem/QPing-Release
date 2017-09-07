/**
 * jquery Main Data
 * Description: 目前主要用于处理json格式的enum
 * Author: wangsy
 * Date  : 2015-04-15
 * Update: 2015-04-15
 *===============================================================================
 * 一、功能说明：
 * 1. 管理前台枚举值的数据
 *
 * 二、使用参考：
 * 1. 依赖 jQuery
 * 2. 引入插件js: enum.js
 * 3. 初始化插件
 *        var main_data = new MAINDATA({
 * 			ajaxFlag : true,
 * 			enumUrl : '/view/demo/maindata/mockData.jsp'
 * 		});
 * 4. 方法参考：
 *    添加enum : main_data.addEnum('test', [{value : 'v1', text : 't1'}]);
 *    查询enum : main_data.getEnum('test');
 *    查询text : main_data.getEnumText('test', 'v1');
 *
 *===============================================================================
 *
 ********************************************************************************/
(function ($) {
    var thisTool = Dolphin;
    function ENUM(param) {
        this.init(param);
    }
    ENUM.defaults = {
        //enum
        valueField: "code",									  //枚举code label
        textField: "name",									  //枚举值 label
        otherField: "other",								   	  //枚举附加属性 label

        //cookie
        cookieFlag : false,                                     //是否支持cookie

        //ajax
        ajaxFlag: false,							   		       //是否支持远程
        enumUrl: null,						     				   //远程url
        enumTextUrl: null,									       //远程取值url
        async: false,					 				           //是否默认异步
        type: "get",					                 		   //默认请求方法
        dataType: "json",									       //默认数据类型
        //contentType: "application/json; charset=UTF-8",	   //默认contentType
        cache: false,									           //默认ajax是否缓存
        enumKey: "id",								               //默认提交参数enumId名称
        enumNameKey: "enumOptionId",						   //默认提交参数enumOptionId名称
        ajax: thisTool.ajax,							           //默认ajax方法
        enumCache: true,										   //ajax请求结果是否缓存到前台
        dataFilter : null                                       //数据处理
    };

    ENUM.prototype = {
        /* ==================== property ================= */
        constructor: ENUM,
        enumData: {},															//前台缓存枚举数据
        enumType: {															//前台创建枚举类型
            lowerCase: "abcdefghijklmnopqrstuvwxyz",
            upperCase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        },

        /* ===================== method ================== */
        init: function (param) {
            this.opts = $.extend({}, ENUM.defaults, param);

            if (this.opts.ajaxFlag) {
                if (this.opts.enumTextUrl == null) {
                    this.opts.enumTextUrl = this.opts.enumUrl;
                }
            }
        },
        addEnumType: function (name, data) {
            this.enumType[name] = data;
        },

        //add enum
        addEnum: function (name, data) {
            this.enumData[name] = data;
            return this;
        },
        createEnum: function (name, data, type, start) {  //TODO
            //init param
            if (typeof data == 'string') {
                data = data.split(',');
            }
            type = type || 'number';
            start = start || 0;

            //init start index
            var indexValue = start;
            if (type != 'number') {
                indexValue = this.enumType[type].indexOf(start);
                if (indexValue < 0) {
                    indexValue = 0;
                }
            }

            //enumData
            var enumData = [];
            var value = null;
            var enumOption = null;
            for (var i = 0; i < data.length; i++) {
                if (type == 'number') {
                    value = indexValue + i;
                } else {
                    value = this.enumType[type].charAt(indexValue + i);
                }

                enumOption = {};
                enumOption[this.opts.valueField] = value;
                enumOption[this.opts.textField] = data[i];

                enumData.push(enumOption);
            }

            this.addEnum.call(this, name, enumData);
            return enumData;
        },

        //cookie enum
        setCookieEnum : function(name, enumObj){
            if(!Dolphin.cookie(name)){
                thisTool.cookie(name, thisTool.json2string(enumObj), {
                    expires: 365,
                    path : thisTool.path.basePath
                });

                if (this.opts.enumCache === true) {
                    this.addEnum(name, enumObj);
                }
            }
        },
        setCookieEnumByAjax : function(name){
            if(!thisTool.cookie(name)){
                var enumObj = this.loadEnum(name);
                if(enumObj){
                    var cookieEnum = [], cookieEnumItem = null;
                    for(var i = 0; i < enumObj.length; i++){
                        cookieEnumItem = {};
                        cookieEnumItem[this.opts.valueField] = enumObj[i][this.opts.valueField];
                        cookieEnumItem[this.opts.textField] = enumObj[i][this.opts.textField];
                        cookieEnum.push(cookieEnumItem);
                    }
                    this.setCookieEnum(name, cookieEnum);
                }
            }
        },
        setCookieEnumsByAjax : function(nameList){
            for(var i = 0; i < nameList.length; i++){
                this.setCookieEnumByAjax(nameList[i]);
            }
        },
        getCookieEnum : function(name){
            var enumStr = thisTool.cookie(name);
            return thisTool.string2json(enumStr);
        },

        //load enum
        loadEnum: function (name) {
            var _this = this;
            var data = {}, url;
            data[this.opts.enumKey] = name;
            url = this.opts.enumUrl.replace("{"+this.opts.enumKey+"}", name);
            var returnData = this.opts.ajax.call(this, {
                url: url,
                data: data,
                async : false
            });

            var enumData = null;
            if(returnData.success && returnData.rows && returnData.rows.length > 0){
                if(typeof _this.opts.dataFilter === 'function'){
                    returnData = _this.opts.dataFilter.call(_this, returnData);
                }
                enumData = returnData.rows;
                if (this.opts.enumCache === true) {
                    this.addEnum.call(this, name, enumData);
                }
            }else{
                console.warn(`枚举项${name}服务端未配置`);
            }

            return enumData;
        },
        loadEnumText: function (name, value) { //TODO
            var text, data = {};
            data[this.opts.enumKey] = name;
            data[this.opts.enumNameKey] = value;

            text = this.opts.ajax.call(this, {
                url: this.opts.enumTextUrl,
                data: data,
                async : false
            });

            return text;
        },

        //get enum
        getEnum: function (name) {
            var enumData = this.enumData[name];

            if(enumData == null && this.opts.cookieFlag == true){
                enumData = this.getCookieEnum.call(this, name);
            }

            if (enumData == null && this.opts.ajaxFlag == true) {
                enumData = this.loadEnum.call(this, name);
            }

            return enumData;
        },
        getEnumText: function (name, value) {
            var enumData = this.getEnum(name);
            var text = value;

            if (enumData) {
                for (var i = 0; i < enumData.length; i++) {
                    if (enumData[i][this.opts.valueField] == value) {
                        text = enumData[i][this.opts.textField];
                        break;
                    }
                }
            } else {
                if (console && console.log) {
                    console.log(thisTool.i18n.get('enum_cannot_found', name));
                }
            }

            return text;
        },
        getEnumOption: function (name, value) {
            var enumData = this.getEnum(name);
            var option = null;

            if (enumData) {
                for (var i = 0; i < enumData.length; i++) {
                    if (enumData[i][this.opts.valueField] == value) {
                        option = enumData[i];
                        break;
                    }
                }
            } else {
                if (console && console.log) {
                    console.log(thisTool.i18n.get('enum_cannot_found', name));
                }
            }

            return option;
        },
        setOptions : function(param){
            $.extend(true, this.opts, param);
            return this;
        }
    };

    thisTool.enum = new ENUM();
})(jQuery);