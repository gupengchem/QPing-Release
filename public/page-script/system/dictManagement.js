/**
 * Created by wangshuyi on 2016/12/27.
 */

'use strict';
const page = {
    editForm : $('#edit-form'),
    detailForm : $('#detail-form'),

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

    thisPage.list = new Dolphin.LIST({
        panel : "#datalist",
        url : thisPage.url.list,
        title : "数据字典列表",
        multiple : false,
        paginationSimpleFlag : true,
        columns : [{
            code: "name",
            title : "名称"
        },{
            code : "code",
            title : "编码"
        }],
        onClick : function(data, row ,event) {
            thisPage.optionList.loadData({
                rows : data.options
            })
        }
    });

    thisPage.optionList = new Dolphin.LIST({
        panel : "#optionList",
        data : {total:0, rows:[]},
        title : "数据项列表",
        pagination : false,
        checkbox : false,
        columns : [{
            code : "code",
            title : "编码"
        },{
            code : "text",
            title : "名称"
        }, {
            code : "state",
            title : "状态"
        }]
    });

    thisPage.editOptionList = new Dolphin.LIST({
        panel : "#editOptionList",
        data : {total:0, rows:[]},
        title : "数据项列表",
        editFlag : true,
        rowIndex : false,
        checkbox : false,
        pagination : false,
        editListName : "options",
        columns : [{
            code : "code",
            title : "编码"
        },{
            code : "text",
            title : "名称"
        }]
    });

    thisPage.editModal = new Dolphin.modalWin({
        content : thisPage.editForm,
        title : "修改信息",
        defaultHidden : true,
        footer : $('#edit_form_footer'),
        hidden : function () {
            Dolphin.form.empty(thisPage.editForm);
            thisPage.editOptionList.empty();
        }
    });
};
page.initEvent = function () {
    const thisPage = this;
    $('#addData').click(function () {
        thisPage._id = "";
        thisPage.editModal.modal('show');
    });
    $('#editDate').click(function () {
        let checkedData = thisPage.list.getChecked();
        if(checkedData.length != 1){
            Dolphin.alert("请选择一条数据");
        }else{
            thisPage._id = checkedData[0]._id;
            Dolphin.form.setValue(checkedData[0], thisPage.editForm);
            thisPage.editOptionList.loadData({
                rows : checkedData[0].options
            });
            thisPage.editModal.modal('show');
        }
    });
    $('#removeDate').click(function () {
        let checkedData = thisPage.list.getChecked();
        if(checkedData.length != 1){
            Dolphin.alert("请选择一条数据");
        }else{
            Dolphin.ajax({
                url : thisPage.url.remove,
                pathData : {id : checkedData[0]._id},
                onSuccess : function (reData) {
                    Dolphin.alert(reData.message, {
                        callback : function () {
                            thisPage.editModal.modal('hide');
                            thisPage.list.reload();
                            thisPage.optionList.empty();
                        }
                    })
                }
            })
        }
    });
    $('#edit_form_save').click(function () {
        let data = Dolphin.form.getValue("edit-form");
        Dolphin.ajax({
            url : thisPage.url.save,
            type : 'post',
            data : Dolphin.json2string(data),
            pathData : {id : thisPage._id},
            onSuccess : function (reData) {
                Dolphin.alert(reData.message, {
                    callback : function () {
                        thisPage.editModal.modal('hide');
                        thisPage.list.reload();
                        thisPage.optionList.empty();
                    }
                })
            }
        })
    });
};

page.formatterDate = function (val) {
    return Dolphin.date2string(Dolphin.string2date(val, "yyyy-MM-ddThh:mm:ss."), "yyyy-MM-dd hh:mm:ss");
};


$(function () {
    Menu.select("dictList");
    page.init();
});