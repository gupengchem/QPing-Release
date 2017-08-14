/**
* Created by wangshuyi on 8/9/2017, 9:00:40 AM.
*/

'use strict';
const page = {
    editForm : $('#edit-form'),
    detailForm : $('#detail-form'),
    imgPreviewModal : $('#imgPreview'),
    queryConditionForm: $('#queryConditionForm'),

    url : {
        list : '/system/tool/file/list',
        remove : '/system/tool/file/remove',
        add : Dolphin.path.contextPath + '/system/tool/file/save',
        update : '/system/tool/file/save/{id}',
        detail : '/system/tool/file/detail/{id}',
        importData : Dolphin.path.contextPath + '/system/tool/file/import',
        exportData : '/system/tool/file/export',
    },

    _id : null,
    list : null,
    editModal : null,
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
        title : "文件列表",
        queryParams : Dolphin.form.getValue('queryConditionForm'),
        columns : [{
            code: "name",
            title : "名称",
            formatter : function (val, row, index) {
                let div = $('<div>');
                if(/^image/.test(row.fileType)){
                    $('<img class="thumbnail">').attr('src', Dolphin.path.uploadPath+row.filePath).click(function (e) {
                        e.stopPropagation();
                        $('<img class="img-responsive">').attr('src', Dolphin.path.uploadPath+row.filePath).appendTo(thisPage.imgPreviewModal);
                        thisPage.imageModal.modal('show');
                    }).appendTo(div);
                }

                $('<span>').html(val).appendTo(div);
                return div;
            }
        },{
            code: "fileSize",
            title : "文件大小",
            formatter: function (val) {
                return getFileSize(val);
            }

        },{
            code: "fileType",
            title : "文件类型",

        },{
            code: "lastUseTime",
            title : "上次使用时间",

        },{
            code: "locked",
            title : "是否锁定",
            formatter: function (val, row) {
                let label = $('<label class="switch switch-primary">').click(function (e) {
                    e.stopPropagation();
                });
                let input = $('<input type="checkbox" class="switch-input">').appendTo(label);
                if(val === 1){
                    input.attr('checked', 'checked');
                }
                input.change(function () {
                    let locked = $(this).attr('checked')?1:0;
                    Dolphin.ajax({
                        url : thisPage.url.update,
                        type : Dolphin.requestMethod.POST,
                        data : Dolphin.json2string({locked: locked}),
                        pathData: {id:row._id},
                    })
                });
                $('<span class="switch-label" data-on="On" data-off="Off">').appendTo(label);
                $('<span class="switch-handle">').appendTo(label);
                return label;
            }
        },{
            code: "type",
            title : "业务类型",

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
    $('#addData').fileupload({
        url: thisPage.url.add+'?type=test',
        dataType: 'json',
        done: function (e, data) {
            Dolphin.alert(data.result.message, {
                callback: function () {
                    thisPage.list.reload();
                }
            })
        },
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
            url : thisPage.url.update,
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

page.formatterDate = function (val) {
    return Dolphin.date2string(new Date(Dolphin.string2date(val, "yyyy-MM-ddThh:mm:ss.").getTime() + 8 * 60 * 60 * 1000), "yyyy-MM-dd hh:mm:ss");
};


$(function () {
    page.init();
});