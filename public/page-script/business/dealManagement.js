/**
* Created by wangshuyi on 8/17/2017, 6:54:19 PM.
*/

'use strict';
const page = {
    editForm : $('#edit-form'),
    detailForm : $('#detail-form'),
    queryConditionForm: $('#queryConditionForm'),

    url : {
        list : '/business/deal/list',
        remove : '/business/deal/remove',
        save : '/business/deal/save/{id}',
        detail : '/business/deal/detail/{id}',
        importData : Dolphin.path.contextPath + '/business/deal/import',
        exportData : '/business/deal/export',
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
    $('#daterange').daterangepicker();
    $('.selectpicker').selectpicker({
        "actionsBox":true
    });

    thisPage.list = new Dolphin.LIST({
        panel : "#datalist",
        url : thisPage.url.list,
        // title : "交易列表",
        queryParams : Dolphin.form.getValue('queryConditionForm'),
        hover: false,
        checkbox: false,
        onLoadSuccess: function (data) {
            if (data.value) {
                $('#totalSum').html(data.value.total);
                $('#feeSum').html(data.value.charge);
            }
        },
        columns : [{
            code: 'happenTime',
            title: '交易时间',
            width: '160px',
            formatter: function (val, row) {
                let html = [];
                html.push('<div>');
                html.push(val);
                html.push('</div><div>');
                html.push(row.payMethod);
                if (row.refundId == '0' || !row.refundId) {
                    html.push('付款');
                } else {
                    html.push('退款');
                }
                html.push('</div>');
                return html.join('');
            }
        }, {
            code: 'mchId',
            title: '客户信息',
            className: "hide_el",
            width: '150px',
            formatter:function (val,row) {
                let html = [];
                html.push('<div>');
                html.push(row.customerName);
                html.push('</div>');
                html.push('<div style="font-size: 90%;">');
                if(row.payMethod === '微信') {
                    html.push('商户号:');
                    html.push(val);
                } else {
                    html.push('门店号:');
                    html.push(row.shopId);
                }
                html.push('</div>');
                html.push('<div style="font-size: 90%;">');
                html.push("设备号:");
                html.push(row.deviceId);
                html.push('</div>');
                return html.join('');
            }
        }, {
            code: '',
            title: '订单号',
            className: "hide_el",
            width:'320px',
            formatter: function (val, row) {
                let html = [];
                html.push('<div>'+row.payMethod+'订单:');
                html.push(row.wechatOrder);
                html.push('</div><div>商户订单:');
                html.push(row.orderNo);
                html.push('</div>');
                return html.join('');
            }
        }, {
            code: '',
            title: '交易',
            className: "hide_el",
            width: '150px',
            formatter: function (val, row) {
                let html = [];
                html.push('<div>类型:');
                html.push(row.payType);
                html.push('</div><div>状态:');
                html.push(row.payStatus);
                html.push('</div>');
                return html.join('');
            }
        }, {
            code: 'productName',
            title: '商品名称',
            className: "hide_el",
            formatter: function (val, row) {
                return val + '，' + (row.nonceStr || '');
            }
        }, {
            code: 'totalAmount',
            title: '金额',
            width: '60px',
            textAlign: 'right'
        }, {
            code: 'promotionAmount',
            title: '优惠',
            width: '60px',
            textAlign: 'right'
        }, {
            code: 'charge',
            title: '手续费',
            width: '60px',
            textAlign: 'right'
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