/**
* Created by wangshuyi on 8/14/2017, 9:34:43 AM.
*/

'use strict';
const page = {
    editForm : $('#edit-form'),
    detailForm : $('#detail-form'),
    queryConditionForm: $('#queryConditionForm'),

    url : {
        remove : '/metaModel/product/remove',
        save : '/metaModel/product/save/{id}',
        detail : '/metaModel/product/detail/{id}',
    },

    _id : '',
    list : null,
    editModal : null,
    detailModal : null,

    init: null,
    initElement: null,
    initEvent: null,
    initData: null,
    showDetail: null,
    formatterDate: null,
};

page.init = function () {
    page.initElement();
    page.initEvent();
    page.initData();
};

page.initElement = function () {
    const thisPage = this;
    Dolphin.form.parse();

};


page.initEvent = function () {
    const thisPage = this;

    //保存
    $('#save').click(function () {
        let data = Dolphin.form.getValue(thisPage.editForm);
        Dolphin.ajax({
            url : thisPage.url.save,
            type : Dolphin.requestMethod.POST,
            data : Dolphin.json2string(data),
            pathData : {id : thisPage._id},
            onSuccess : function (reData) {
                Dolphin.alert(reData.message, {
                    callback : function () {
                        Dolphin.goUrl(`/metaModel/productList`);
                    }
                });
            }
        });
    });
    //取消
    $('#cancel').click(function () {
        Dolphin.goUrl(`/metaModel/productList`);
    });
};

page.initData = function () {
    const thisPage = this;

    if(contextData.data.id){
        thisPage._id = contextData.data.id;
        Dolphin.ajax({
            url: thisPage.url.detail,
            pathData: {id: contextData.data.id},
            onSuccess: function (reData) {
                Dolphin.form.setValue(reData.data, thisPage.editForm);
            }
        })
    }

};


page.formatterDate = function (val) {
    return Dolphin.date2string(new Date(Dolphin.string2date(val, "yyyy-MM-ddThh:mm:ss.").getTime() + 8 * 60 * 60 * 1000), "yyyy-MM-dd hh:mm:ss");
};


$(function () {
    page.init();
});