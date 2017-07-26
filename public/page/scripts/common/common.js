/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved. 
 */

/**
 * 命名空间的定义
 * @param namespace
 * @returns {namespace}
 */
function namespace(namespace) {
    let object = this,
        tokens = namespace.split("."),
        token;
    while (tokens.length > 0) {
        token = tokens.shift();
        if (typeof object[token] === "undefined") {
            object[token] = {};
        }
        object = object[token];
    }
    /**
     * 此空间内的对象销毁
     * @param key
     */
    object.destroy = function (key) {
        //TODO:研究:我们需要知道当我们删除此对象的时候，
        // 在此对象中设置的一些事件绑定，是否会清除掉。
        if (this[key]) {
            for (let k in this[key]) {
                delete this[key][k];
            }
        }
        this[key] = null;
    };
    return object;
}
namespace("org.breezee");

/**
 * 设置本地的log，来支持在debug
 */
org.breezee.logger = console;

/**
 * list空间中的一些util方法
 * @type {{edit: org.breezee.buttons.edit, del: org.breezee.buttons.del, editCallback: org.breezee.buttons.editCallback, delCallback: org.breezee.buttons.delCallback}}
 */
org.breezee.buttons = {
    /**
     * 创建编辑按钮，在list中
     * @param data
     * @param callback
     * @returns {string}
     */
    edit: function (data, callback) {
        let s = '<a class="btn btn-outline btn-circle btn-sm purple editBtn" ';
        if (data) {
            for (let k in data) {
                if (data[k])
                    s += 'data-' + k + '="' + data[k] + '"';
            }
        }
        s += ' href="javascript:;"><i class="fa fa-edit"></i>编辑</a>';
        return s;
    },
    /**
     * 创建删除按钮，在list中
     * @param data
     * @param callback
     * @returns {string}
     */
    del: function (data, callback) {
        let s = '<a class="btn btn-outline btn-circle btn-sm dark delBtn" ';
        if (data) {
            for (let k in data) {
                if (data[k])
                    s += 'data-' + k + '="' + data[k] + '"';
            }
        }
        s += ' href="javascript:void(0);"><i class="fa fa-trash-o"></i>删除</a>';
        return s;
    },
    /**
     * 查看按钮
     * @param data
     * @param callback
     * @returns {string}
     */
    view: function (data, callback) {
        let s = '<a class="btn btn-outline btn-sm dark viewBtn" ';
        if (data) {
            for (let k in data) {
                if (data[k])
                    s += 'data-' + k + '="' + data[k] + '"';
            }
        }
        s += ' href="javascript:;"><i class="fa fa-share"></i>查看</a>';
        return s;
    },
    /**
     * 编辑按钮的回调
     * @param apiId
     * @param field
     * @param cb
     */
    editCallback: function (apiId, field, cb) {
        $('.editBtn').click(function () {
            let _this = $(this);
            Dolphin.ajax({
                url: '/api/' + apiId + '@' + field + '=' + _this.data(field),
                type: Dolphin.requestMethod.GET,
                onSuccess: function (reData) {
                    Dolphin.form.setValue(reData.value, '.edit-form');
                    if (cb)
                        cb.call(this, reData)
                }
            });
        });
    },
    /**
     * 删除按钮的回调
     * @param apiId
     * @param cb
     */
    delCallback: function (apiId, cb) {
        $('.delBtn').click(function () {
            let _this = $(this);
            Dolphin.confirm('确认删除？', {
                callback: function (flag) {
                    if (flag) {
                        Dolphin.ajax({
                            url: '/api/' + apiId + '@id=' + _this.data('id'),
                            type: Dolphin.requestMethod.DELETE,
                            onSuccess: function (reData) {
                                if (cb)
                                    cb.call(this, reData)
                            }
                        });
                    }
                }
            })
        });
    },
    /**
     * 查看按钮的回调
     * @param apiId
     * @param cb
     */
    viewCallback: function (apiId, field, cb) {
        $('.viewBtn').click(function () {
            let _this = $(this);
            Dolphin.ajax({
                url: '/api/' + apiId + '@' + field + '=' + _this.data(field),
                type: Dolphin.requestMethod.GET,
                onSuccess: function (reData) {
                    Dolphin.form.setValue(reData.value, '.edit-form');
                    if (cb)
                        cb.call(this, reData)
                }
            });
        });
    }
};

/**
 * 设置本地的log，来支持在debug
 */
org.breezee.logger = console;

org.breezee.utils = {
    /*****
     * ASYNC LOAD
     * Load JS files and CSS files asynchronously in ajax mode
     */
    loadJS: function (jsFiles, pageScript, callback) {
        let i;
        for (i = 0; i < jsFiles.length; i++) {
            let body = document.getElementsByTagName('body')[0];
            let script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = 'defer';
            script.src = jsFiles[i];
            body.appendChild(script);
        }
        if (pageScript) {
            let body = document.getElementsByTagName('body')[0];
            let script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = false;
            script.src = pageScript;
            body.appendChild(script);
        }
    },

    loadCSS: function (cssFile, end, callback) {
        let cssArray = {};
        if (!cssArray[cssFile]) {
            cssArray[cssFile] = true;
            if (end === 1) {
                let head = document.getElementsByTagName('head')[0];
                let s = document.createElement('link');
                s.setAttribute('rel', 'stylesheet');
                s.setAttribute('type', 'text/css');
                s.setAttribute('href', cssFile);
                s.onload = callback;
                head.appendChild(s);
            } else {
                let head = document.getElementsByTagName('head')[0];
                let style = document.getElementById('main-style');
                let s = document.createElement('link');
                s.setAttribute('rel', 'stylesheet');
                s.setAttribute('type', 'text/css');
                s.setAttribute('href', cssFile);
                s.onload = callback;
                head.insertBefore(s, style);
            }
        } else if (callback) {
            callback();
        }
    },

    escape2Html: function (str) {
        let arrEntities = {'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"', 'amp;quot': '"'};
        return str.replace(/&(lt|gt|nbsp|amp;quot|quot|amp);/ig, function (all, t) {
            return arrEntities[t];
        });
    },

    capitalizeFirstLetter: function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    random: function (key) {
        return ((Math.floor(Math.random() * (1 + 40 - 20)) ) + 20) * key;
    }
};

org.breezee.menu = function (path) {
    let pp = path.split('/');
    console.log(pp, '-----------');
    $("#top_" + pp[1]).addClass('active');
};
