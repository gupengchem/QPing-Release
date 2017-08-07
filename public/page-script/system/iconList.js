/**
 * Created by wangshuyi on 2016/12/27.
 */

'use strict';
const page = {
    url : {
        list : '/system/dict/list',
        remove : '/system/dict/remove/{id}',
        save : '/system/dict/save/{id}',
        detail : '/system/dict/detail/{id}',
    },

    _id : null
};

page.init = function () {
    page.initElement();
    page.initEvent();
};

page.initElement = function () {
    const thisPage = this;
};
page.initEvent = function () {
    const thisPage = this;
};

page.formatterDate = function (val) {
    return Dolphin.date2string(Dolphin.string2date(val, "yyyy-MM-ddThh:mm:ss."), "yyyy-MM-dd hh:mm:ss");
};


$(function () {
    page.init();
});