/**
* Created by wangshuyi on 8/22/2017, 9:11:17 AM.
*/

'use strict';
const page = {
    editForm : $('#edit-form'),
    detailForm : $('#detail-form'),
    queryConditionForm: $('#queryConditionForm'),

    typeInput : $('select[name="inputType"]'),

    url : {
        list : '/metaModel/attribute/list',
        remove : '/metaModel/attribute/remove',
        save : '/metaModel/attribute/save/{id}',
        detail : '/metaModel/attribute/detail/{id}',
        importData : Dolphin.path.contextPath + '/metaModel/attribute/import',
        exportData : '/metaModel/attribute/export',
    },

    _id : null,
    list : null,
    editModal : null,
    detailModal : null,

    init: null,
    initElement: null,
    initEvent: null,
    showDetail: null,
    formatterDate: null,
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
        title : "属性列表",
        queryParams : Dolphin.form.getValue('queryConditionForm'),
        columns : [{
            code: "name",
            title : "名称",
            
            formatter : function (val, row, index) {
                let link = $('<a href="javascript:void(0);">');
                link.click(function () {
                    thisPage.showDetail(row._id);
                }).html(val);
                return link;
            }
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
        }]
    });

    thisPage.editModal = new Dolphin.modalWin({
        content : thisPage.editForm,
        title : "修改信息",
        defaultHidden : true,
        footer : $('#edit_form_footer'),
        hidden : function () {
            Dolphin.form.empty(thisPage.editForm);
        }
    });

    thisPage.detailModal = new Dolphin.modalWin({
        content : thisPage.detailForm,
        title : "查看详情",
        defaultHidden : true,
        hidden : function () {
            Dolphin.form.empty(thisPage.detailForm);
        }
    })
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
        thisPage.editForm.find('div[inputType]').hide();
        thisPage.editModal.modal('show');
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
            thisPage.editModal.modal('show');
        }
    });

    //删除
    $('#removeDate').click(function () {
        let checkedData = thisPage.list.getChecked(), ids=[];
        if(checkedData.length == 0){
            Dolphin.alert("请至少选择一条数据");
        }else{
            checkedData.forEach(function (oa) {
                ids.push(oa._id);
            });

            Dolphin.confirm("确定要删除这些数据吗？", {
                callback : function (flag) {
                    if(flag){
                        Dolphin.ajax({
                            url : thisPage.url.remove,
                            data : Dolphin.json2string({ids : ids}),
                            type : Dolphin.requestMethod.POST,
                            onSuccess : function (reData) {
                                Dolphin.alert(reData.message, {
                                    callback : function () {
                                        thisPage.list.reload();
                                    }
                                })
                            }
                        });
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
                        thisPage.editModal.modal('hide');
                        thisPage.list.reload();
                    }
                });
            }
        });
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
        loading : true,
        onSuccess : function (reData) {
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
            thisPage.detailModal.modal('show');
        }
    })
};

page.formatterDate = function (val) {
    return Dolphin.date2string(new Date(Dolphin.string2date(val, "yyyy-MM-ddThh:mm:ss.").getTime() + 8 * 60 * 60 * 1000), "yyyy-MM-dd hh:mm:ss");
};


$(function () {
    page.init();
});