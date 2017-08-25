/**
* Created by wangshuyi on 8/24/2017, 6:03:09 PM.
*/

'use strict';
const page = {
    editForm : $('#edit-form'),
    detailForm : $('#detail-form'),
    queryConditionForm: $('#queryConditionForm'),
    imgPreviewModal : $('#imgPreview'),

    url : {
        list : '/salesUtil/product/list',
        remove : '/salesUtil/product/remove',
        save : '/salesUtil/product/save/{id}',
        detail : '/salesUtil/product/detail/{id}',
        importData : Dolphin.path.contextPath + '/salesUtil/product/import',
        exportData : '/salesUtil/product/export',

        file : {
            add : Dolphin.path.contextPath + '/system/tool/file/save?type=product',
        }
    },

    _id : '',
    list : null,
    editModal : null,
    detailModal : null,
    imageModal : null,

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
        title : "产品列表",
        queryParams : Dolphin.form.getValue('queryConditionForm'),
        columns : [{
            code: "name",
            title : "名称",
            formatter: function (val, row) {
                let div = $('<div>');
                $('<img class="thumbnail">').css('float','left').attr('src', Dolphin.path.uploadFileGet+row.image).click(function (e) {
                    e.stopPropagation();
                    $('<img class="img-responsive">').attr('src', Dolphin.path.uploadFileGet+row.image).appendTo(thisPage.imgPreviewModal);
                    thisPage.imageModal.modal('show');
                }).appendTo(div);

                $('<div>').html(val).appendTo(div);
                $('<div>').html(row.appName).appendTo(div);
                return div;
            }

        },{
            code: "shortName",
            title : "短名",

        },{
            code: "price",
            title : "价格",
            
        },{
            code: "reviewFlag",
            title : "review",
            formatter: function (val) {
                return Dolphin.enum.getEnumText('Boolean', val);
            }
            
        },{
            code: "feedbackFlag",
            title : "feedback",
            formatter: function (val) {
                return Dolphin.enum.getEnumText('Boolean', val);
            }

        },{
            code: "store.name",
            title : "所属店铺",
            
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

    thisPage.imageModal = new Dolphin.modalWin({
        content : thisPage.imgPreviewModal,
        title : "图片预览",
        defaultHidden : true,
        hidden : function () {
            thisPage.imgPreviewModal.empty();
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
            if(data.store){
                data.store = data.store._id;
            }
            Dolphin.form.setValue(data, thisPage.editForm);
            if(checkedData[0].image){
                let img = $('<img class="img-responsive">').css('max-height','100px').attr('src', Dolphin.path.uploadFileGet+checkedData[0].image);
                $('#productImgPreview').html(img);
            }
            Dolphin.toggleCheck(thisPage.editForm.find('input[name="reviewFlag"]'), !!checkedData[0].reviewFlag);
            Dolphin.toggleCheck(thisPage.editForm.find('input[name="feedbackFlag"]'), !!checkedData[0].feedbackFlag);
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
        data.reviewFlag = !!data.reviewFlag;
        data.feedbackFlag = !!data.feedbackFlag;

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
    $('#productImage').fileupload({
        url: thisPage.url.file.add,
        dataType: 'json',
        done: function (e, data) {
            let img = $('<img class="img-responsive">').css('max-height','100px').attr('src', Dolphin.path.uploadPath+data.result.data.filePath);
            $('#productImgPreview').html(img);
            $('input[name="image"]').val(data.result.data._id);
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