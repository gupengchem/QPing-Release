/**
* Created by wangshuyi on 8/10/2017, 2:31:23 PM.
*/

'use strict';
const page = {
    editForm : $('#edit-form'),
    detailForm : $('#detail-form'),
    queryConditionForm: $('#queryConditionForm'),

    typeInput : $('select[name="inputType"]'),

    url : {
        list : '/metaModel/attribute/list',
        remove : '/metaModel/attribute/remove/{id}',
        save : '/metaModel/attribute/save/{id}',
        detail : '/metaModel/attribute/detail/{id}',
        importData : Dolphin.path.contextPath + '/metaModel/attribute/import',
        exportData : '/metaModel/attribute/export',
    },

    _id : null,
    list : null,

    init: null,
    initElement: null,
    initEvent: null,
    showDetail: null,
    formatterDate: null,
    toggleEditState: null,
};

page.init = function () {
    page.initElement();
    page.initEvent();
};

page.initElement = function () {
    const thisPage = this;
    Dolphin.form.parse();


    thisPage.list = new Dolphin.LIST({
        panel : "#datalist",
        url : thisPage.url.list,
        multiple: false,
        title : "属性列表",
        queryParams : Dolphin.form.getValue('queryConditionForm'),
        columns : [{
            code: "name",
            title : "名称",
        },{
            code: "code",
            title : "编码",
        },{
            code: "required",
            title : "必填",
            formatter: function (val) {
                return Dolphin.enum.getEnumText('Boolean', val);
            }
        },{
            code: "defaultValue",
            title : "默认值",
            formatter: function (val) {
                return val || '无';
            }
        },
        // {
        //     code: "i18n",
        //     title : "国际化",
        //     formatter: function (val) {
        //         return Dolphin.enum.getEnumText('Boolean', val);
        //     }
        // },
            {
            code: "inputType",
            title : "输入类型",
            formatter: function (val) {
                return Dolphin.enum.getEnumText('formInputType', val);
            }
        }],
        onClick: function (data) {
            thisPage.showDetail(data._id);
        },
        onLoadSuccess: function () {
            if(thisPage._id){
                this.check(thisPage._id, true);
            }
        }
    });
};


page.initEvent = function () {
    const thisPage = this;

    //查询
    thisPage.queryConditionForm.submit(function () {
        thisPage.list.query(Dolphin.form.getValue('queryConditionForm'));
        return false;
    });

    //新增
    $('#addData').click(function () {
        thisPage._id = "";
        thisPage.toggleEditState('edit', true);
        thisPage.editForm.find('div[inputType]').hide();
    });

    //修改
    $('#editDate').click(function () {
        let checkedData = thisPage.list.getChecked();
        if(checkedData.length != 1){
            Dolphin.alert("请选择一条数据");
        }else{
            thisPage._id = checkedData[0]._id;
            Dolphin.form.setValue(checkedData[0], thisPage.editForm);
            thisPage.typeInput.change();
            thisPage.toggleEditState('edit');
        }
    });

    //删除
    $('#removeDate').click(function () {
        let checkedData = thisPage.list.getChecked();
        if(checkedData.length != 1){
            Dolphin.alert("请选择一条数据");
        }else{
            Dolphin.confirm("确定要删除这条数据吗？", {
                callback : function (flag) {
                    if(flag){
                        Dolphin.ajax({
                            url : thisPage.url.remove,
                            pathData : {id : checkedData[0]._id},
                            onSuccess : function (reData) {
                                Dolphin.alert(reData.message, {
                                    callback : function () {
                                        thisPage._id = '';
                                        thisPage.list.reload();
                                        thisPage.toggleEditState('detail', true);
                                    }
                                })
                            }
                        })
                    }
                }
            });
        }
    });

    //保存
    $('#edit_form_save').click(function () {
        let data = Dolphin.form.getValue("edit-form");
        Dolphin.ajax({
            url : thisPage.url.save,
            type : Dolphin.requestMethod.POST,
            data : Dolphin.json2string(data),
            pathData : {id : thisPage._id},
            onSuccess : function (reData) {
                Dolphin.alert(reData.message, {
                    callback : function () {
                        thisPage._id = reData.data._id;
                        thisPage.list.reload();
                        thisPage.showDetail(reData.data._id);
                        thisPage.toggleEditState('detail');
                    }
                });
            }
        });
    });
    //取消
    $('#edit_form_cancel').click(function () {
        thisPage.toggleEditState();
    });

    //导入
    $('#importData').fileupload({
        url: thisPage.url.importData,
        dataType: 'json',
        done: function (e, data) {
            Dolphin.alert(data.result.message, {
                callback: function () {
                    thisPage.list.reload();
                }
            })
        },
        progressall: function (e, data) {
            // console.log(data);
        }
    });
    //导出
    $('#exportDate').click(function () {
        window.open(thisPage.url.exportData + '?' + thisPage.queryConditionForm.serialize());
    });

    thisPage.typeInput.change(function () {
        thisPage.editForm.find('div[inputType]').hide();
        thisPage.editForm.find('div[inputType="'+$(this).val()+'"]').show();
    });
};

page.showDetail = function (_id) {
    let thisPage = this;
    Dolphin.ajax({
        url : thisPage.url.detail,
        pathData : {id : _id},
        //loading : true,
        onSuccess : function (reData) {
            thisPage.toggleEditState(null, true);
            Dolphin.form.setValue(reData.data, thisPage.detailForm, {
                formatter : {
                    createTime : function (val) {
                        return thisPage.formatterDate(val);
                    },
                    updateTime : function (val) {
                        return thisPage.formatterDate(val);
                    }
                }
            });
            thisPage.detailForm.find('div[inputType]').hide();
            thisPage.detailForm.find('div[inputType="'+reData.data.inputType+'"]').show();
        }
    })
};

page.formatterDate = function (val) {
    return Dolphin.date2string(new Date(Dolphin.string2date(val, "yyyy-MM-ddThh:mm:ss.").getTime() + 8 * 60 * 60 * 1000), "yyyy-MM-dd hh:mm:ss");
};
page.toggleEditState = function (state, flag) {
    state = state || 'detail';
    flag = flag || false;
    let thisPage = this;
    if(flag){
        Dolphin.form.empty(thisPage.detailForm);
        Dolphin.form.empty(thisPage.editForm);
    }
    switch(state){
        case 'edit':
            thisPage.detailForm.hide();
            thisPage.editForm.show();
            break;
        case 'detail':
            thisPage.detailForm.show();
            thisPage.editForm.hide();
            break;
    }
};


$(function () {
    page.init();
});