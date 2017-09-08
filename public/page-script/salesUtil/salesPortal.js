/**
* Created by wangshuyi on 8/24/2017, 10:34:03 PM.
*/

'use strict';
const page = {
    editForm : $('#edit-form'),
    orderForm : $('#order-form'),
    detailForm : $('#detail-form'),
    queryConditionForm: $('#queryConditionForm'),
    imgPreviewModal : $('#imgPreview'),

    processPdfButton : $('#processPdf'),
    quickCreateButton : $('#quickCreate'),

    url : {
        list : '/salesUtil/sales/list',
        remove : '/salesUtil/sales/remove',
        save : '/salesUtil/sales/save/{id}',
        updateInfo : '/salesUtil/sales/updateInfo/{type}/{id}',
        quickCreate : '/salesUtil/sales/quickCreate',
        processPdf : '/salesUtil/sales/processPdf',
        detail : '/salesUtil/sales/detail/{id}',
        importData : Dolphin.path.contextPath + '/salesUtil/sales/import',
        exportData : '/salesUtil/sales/export',

        product: {
            list: '/salesUtil/product/portalList',
        },

        file : {
            add : Dolphin.path.contextPath + '/system/tool/file/save',
        }
    },

    _id : null,
    list : null,
    editModal : null,
    detailModal : null,
    imageModal : null,
    orderModal : null,

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

    $('.date-picker').datepicker({
        autoclose: true,
    });

    thisPage.productList = new Dolphin.LIST({
        panel : "#productList",
        url : thisPage.url.product.list,
        title : "产品列表",
        paginationSimpleFlag: true,
        queryParams : Dolphin.form.getValue('queryConditionForm'),
        multiple: false,
        columns : [{
            code: "name",
            title : "名称",
            width: '50%',
            formatter: function (val, row) {
                let div = $('<div>');
                $('<img class="thumbnail">').css('float','left').attr('src', Dolphin.path.uploadFileGet+row.image).click(function (e) {
                    e.stopPropagation();
                    $('<img class="img-responsive">').attr('src', Dolphin.path.uploadFileGet+row.image).appendTo(thisPage.imgPreviewModal);
                    thisPage.imageModal.modal('show');
                }).appendTo(div);

                $('<div class="textNowrap">').html(val).appendTo(div);
                $('<div>').html(row.searchName).appendTo(div);
                return div;
            }

        },{
            code: "keyword",
            title : "关键字",

        },{
            code: "store.name",
            title : "店铺",

        },{
            code: "price",
            title : "价格",
            textAlign: 'right',
            width:'50px',
        },{
            code: '__',
            title: '概况',
            width:'45px',
            formatter: function (val, row) {
                return `${row.unFinishedCount} / ${row.totalCount}`;
            }
        }],
        onChecked: function (data) {
            thisPage._id = data._id;
            thisPage.list.query({
                product: data._id,
            });
            Dolphin.toggleEnable($('#quickCreate'), true);
        },
        onLoadSuccess: function (data) {
            if(thisPage._id){
                $(thisPage.productList.opts.panel).find('input[value="'+thisPage._id+'"]').attr('checked','checked');
            }
        }
    });

    thisPage.list = new Dolphin.LIST({
        panel : "#dataList",
        url : thisPage.url.list,
        data: {total: 0, rows:[]},
        checkbox: false,
        columns : [{
            code: "orderNo",
            title : "订单号",
            formatter: function (val) {
                return val?$('<div class="textNowrap">').html(val):'暂无';
            }
        },{
            code: "buyer",
            title : "买手",
            formatter: function (val) {
                return val?`${val.name} (${val.code})`:'';
            }
        },{
            code: "status",
            title : "状态",
            formatter: function (val) {
                return $('<span>').addClass(`SalesStatus_${val}`).html(Dolphin.enum.getEnumText('SalesStatus', val));
            }
        },{
            code:'operation',
            title:' ',
            width: '200px',
            className: 'DolphinOperation',
            formatter: function (val, row) {
                let content = $('<div>');
                $('<button class="btn btn-default btn-sm">').html('order').click(function () {
                    let data = Object.assign({}, row);
                    if(data.buyer){
                        data.buyer = data.buyer._id;
                    }
                    Dolphin.form.setValue(data, thisPage.orderForm);
                    thisPage.orderModal.modal('show');
                }).appendTo(content);

                if(row.product.reviewFlag){
                    let reviewButton = $('<button type="button" class="btn btn-default btn-sm fileinput-button">').html('review').appendTo(content);
                    let uploadInput = $('<input type="file" name="media" />').appendTo(reviewButton);

                    //上传订单文件
                    uploadInput.fileupload({
                        url: thisPage.url.file.add + '?type=review',
                        dataType: 'json',
                        done: function (e, data) {
                            let _data = {reviewFlag: 1, reviewFile: data.result.data._id};
                            Dolphin.ajax({
                                url : thisPage.url.updateInfo,
                                type : Dolphin.requestMethod.POST,
                                data : Dolphin.json2string(_data),
                                pathData : {id : row._id, type:'review'},
                                onSuccess : function (reData) {
                                    thisPage.list.reload();
                                }
                            });
                        },
                        progressall: function (e, data) {
                            // console.log(data);
                        }
                    });
                }

                if(row.product.feedbackFlag){
                    let feedbackButton = $('<button type="button" class="btn btn-default btn-sm fileinput-button">').html('feedback').appendTo(content);
                    let uploadInput = $('<input type="file" name="media" />').appendTo(feedbackButton);

                    //上传订单文件
                    uploadInput.fileupload({
                        url: thisPage.url.file.add + '?type=feedback',
                        dataType: 'json',
                        done: function (e, data) {
                            let _data = {feedbackFlag: 1, feedbackFile: data.result.data._id};
                            Dolphin.ajax({
                                url : thisPage.url.updateInfo,
                                type : Dolphin.requestMethod.POST,
                                data : Dolphin.json2string(_data),
                                pathData : {id : row._id, type:'feedback'},
                                onSuccess : function (reData) {
                                    thisPage.list.reload();
                                }
                            });
                        },
                        progressall: function (e, data) {
                            // console.log(data);
                        }
                    });
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
            // Dolphin.form.empty(thisPage.editForm);
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

    thisPage.imageModal = new Dolphin.modalWin({
        content : thisPage.imgPreviewModal,
        title : "图片预览",
        defaultHidden : true,
        hidden : function () {
            thisPage.imgPreviewModal.empty();
        }
    });

    thisPage.orderModal = new Dolphin.modalWin({
        content : thisPage.orderForm,
        title : "修改信息",
        defaultHidden : true,
        footer : $('#order_form_footer'),
        hidden : function () {
            Dolphin.form.empty(thisPage.orderForm);
        }
    });
};


page.initEvent = function () {
    const thisPage = this;

    //查询
    thisPage.queryConditionForm.submit(function () {
        thisPage.productList.query(Dolphin.form.getValue('queryConditionForm'));
        return false;
    });

    //处理pdf
    thisPage.processPdfButton.click(function () {
        Dolphin.ajax({
            url: thisPage.url.processPdf,
            loading: true,
            onSuccess: function (result) {
                Dolphin.alert(`order处理：成功${result.data.order.success}条，失败${result.data.order.fail}条。<br/>review处理：成功${result.data.review.success}条，失败${result.data.review.fail}条。`, {
                    callback: function () {
                        thisPage.list.empty();
                        thisPage.productList.reload();
                    }
                });
            }
        })
    });

    //保存
    $('#edit_form_save').click(function () {
        let checkedData = thisPage.productList.getChecked();
        if(checkedData.length != 1){
            Dolphin.alert("请选择一条数据");
        }else{
            let data = Dolphin.form.getValue("edit-form");
            data.product = checkedData[0]._id;
            Dolphin.ajax({
                url : thisPage.url.quickCreate,
                type : Dolphin.requestMethod.POST,
                data : Dolphin.json2string(data),
                onSuccess : function (reData) {
                    Dolphin.alert(reData.message, {
                        callback : function () {
                            thisPage.editModal.modal('hide');
                            thisPage.list.reload();
                            thisPage.productList.reload();
                        }
                    });
                }
            });
        }

    });

    //更新订单号
    $('#order_form_save').click(function () {
        let data = Dolphin.form.getValue("order-form");
        let _id = data._id;
        delete data._id;
        Dolphin.ajax({
            url : thisPage.url.updateInfo,
            type : Dolphin.requestMethod.POST,
            data : Dolphin.json2string(data),
            pathData : {id : _id, type:'order'},
            onSuccess : function (reData) {
                Dolphin.alert(reData.message, {
                    callback : function () {
                        thisPage.orderModal.modal('hide');
                        thisPage.list.reload();
                    }
                });
            }
        });
    });

    //上传订单文件
    $('#orderFile').fileupload({
        url: thisPage.url.file.add + '?type=order',
        dataType: 'json',
        done: function (e, data) {
            $('#fileName').html(data.result.data.name);
            $('input[name="orderFile"]').val(data.result.data._id);
        },
        progressall: function (e, data) {
            // console.log(data);
        }
    });

    //快速添加明日订单
    thisPage.quickCreateButton.click(function () {
        let product = thisPage.productList.getChecked()[0]._id;
        Dolphin.ajax({
            url : thisPage.url.quickCreate,
            type : Dolphin.requestMethod.POST,
            data : Dolphin.json2string({product: product, count: 1}),
            onSuccess : function (reData) {
                thisPage.list.reload();
                thisPage.productList.reload();
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