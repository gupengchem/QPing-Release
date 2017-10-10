/**
* Created by wangshuyi on 8/24/2017, 10:34:03 PM.
*/

'use strict';
const page = {
    editForm : $('#edit-form'),
    detailForm : $('#detail-form'),
    payForm : $('#pay-form'),
    queryConditionForm: $('#queryConditionForm'),

    url : {
        list : '/salesUtil/sales/list',
        remove : '/salesUtil/sales/remove',
        save : '/salesUtil/sales/save/{id}',
        detail : '/salesUtil/sales/detail/{id}',
        importData : Dolphin.path.contextPath + '/salesUtil/sales/import',
        exportData : '/salesUtil/sales/export',

        buyer: {
            detail : '/salesUtil/buyer/detail/{id}',
        }
    },

    _id : null,
    list : null,
    editModal : null,
    detailModal : null,
    payModal : null,
    _payId : null,

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

    $('.date-picker').datepicker();

    thisPage.list = new Dolphin.LIST({
        panel : "#datalist",
        url : thisPage.url.list,
        title : "销售列表",
        queryParams : Dolphin.form.getValue('queryConditionForm'),
        columns : [{
            code: "orderNo",
            title : "订单号",
            formatter: function (val) {
                return val?val:'暂无'
            }
        },{
            code: "store.name",
            title : "店铺",

        },{
            code: "product.name",
            title : "产品",
            
        },{
            code: "status",
            title : "状态",
            formatter: function (val) {
                return Dolphin.enum.getEnumText('SalesStatus', val);
            }
        },{
            code: "date",
            title : "出单日期",
            
        },{
            code: "buyer.name",
            title : "买手",
        },{
            code: "buyer.code",
            title : "编号",

        },{
            code: "product.price",
            title : "价格",

        },{
            code:'operation',
            title:' ',
            className: 'DolphinOperation',
            formatter: function (val, row) {
                let content = $('<div>');
                if(row.status === 'finished'){
                    let payButton = $('<button type="button" class="btn btn-default btn-sm fileinput-button">').html('pay').appendTo(content);
                    payButton.click(function () {
                        Dolphin.ajax({
                            url : thisPage.url.buyer.detail,
                            pathData : {id : row.buyer._id},
                            loading : true,
                            onSuccess : function (reData) {
                                thisPage._payId = row._id;
                                Dolphin.form.setValue(reData.data, thisPage.payForm);
                                thisPage.payModal.modal('show');
                            }
                        })
                    })
                }

                return content;
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
    });

    thisPage.payModal = new Dolphin.modalWin({
        content : thisPage.payForm,
        title : "查看详情",
        defaultHidden : true,
        footer : $('#pay_form_footer'),
        hidden : function () {
            Dolphin.form.empty(thisPage.payForm);
        }
    });

    $('#buyerSelect').selectpicker({
        "liveSearch":true
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
        thisPage.editModal.modal('show');
    });

    //修改
    $('#editDate').click(function () {
        let checkedData = thisPage.list.getChecked();
        if(checkedData.length != 1){
            Dolphin.alert("请选择一条数据");
        }else{
            thisPage._id = checkedData[0]._id;
            let data = Object.assign({}, checkedData[0]);
            if(data.product){
                data.product = data.product._id;
            }
            if(data.buyer){
                data.buyer = data.buyer._id;
            }
            Dolphin.form.setValue(data, thisPage.editForm);
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
                                        thisPage.editModal.modal('hide');
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

    //付款
    $('#pay_form_save').click(function () {
        let data = {status: 'paid'};
        Dolphin.ajax({
            url : thisPage.url.save,
            type : Dolphin.requestMethod.POST,
            data : Dolphin.json2string(data),
            pathData : {id : thisPage._payId},
            onSuccess : function (reData) {
                thisPage.payModal.modal('hide');
                thisPage.list.reload();
            }
        });
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