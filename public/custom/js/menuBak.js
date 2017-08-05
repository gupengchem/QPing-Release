/**
 * Created by wangshuyi on 2017/8/3.
 */

'use strict';

/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved.
 */

org.breezee.menu = (function () {
    let _this = this;
    /**
     * 初始化
     */
    this.init = function () {
        _this.initEvent();
    };
    /**
     * 初始化监听事件
     */
    this.initEvent = function () {
        /** 左侧二级菜单的点击事件**/
        $(".workspaceMenuPanel a").click(function () {
            $(".menu-item").removeClass("selected");
            $(this).parent().addClass("selected");
            //TODO:判断，如果是IE浏览器，则进行页面的跳转即可。
            window.history.pushState(null, null, "?menu=" + $(this).data('menu'));
            _this.menuClick($(this).data());
        });
        /**浏览器后退按钮和前进按钮的点击，刷新页面**/
        window.onpopstate = function (event) {
            // if (document.location)
            //     location.href = document.location;
        };
    };
    /**
     * 二级菜单点击事件
     * @param query
     */
    this.menuClick = function (query) {
        let link = query.menuLink?query.menuLink:query.menu;
        $.ajax({
            url: link+'?'+this.object2params(query),
            async: false,
            context: $(".page-content"),
            dataType: 'html',
            global: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('templateFileName', link);
            },
            complete: function (xhr, ts) {
                updateShopType();
            },
            error: function (xhr, err, exp) {
                console.log(err, exp);
                if (xhr.status == 403) {
                    alert('登录过期，请重新登录');
                    location.reload();
                } else {
                    alert('系统错误，请联系管理员!');
                }
            },
            success: function (content, textStatus) {
                //destroy defined in common.js with the namespace
                org.breezee.destroy('page');
                $(this).empty();
                $(this).append(content);

            }
        });
    };
    /**
     * 横向一级菜单的点击，主要供页面初始化时候
     * @param code
     */
    this.topSelect = function (code) {
        $('.' + code).addClass('active');
        this.subSelect(org.breezee.context.queryData);
    };
    /**
     * 纵向二级菜单的点击，供页面初始化时候
     * @param query
     */
    this.subSelect = function (query) {
        if (query.menu) {
            $(".menu-item").removeClass("selected");
            $('.' + query.menu).addClass("selected");
            _this.menuClick(query);
        }
    };
    this.object2params = function (obj) {
        let s = [], k;
        for(k in obj){
            s.push(k+'='+obj[k]);
        }
        return s.join("&");
    };
    this.init();
    return this;
})();






