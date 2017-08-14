/**
* Created by wangshuyi on 8/10/2017, 3:23:37 PM.
*/

'use strict';
const page = {
    editForm : $('#edit-form'),
    detailForm : $('#detail-form'),
    queryConditionForm: $('#queryConditionForm'),
    transferButton: $('#transferAttribute'),

    url : {
        list : '/metaModel/model/find',
        tree : '/metaModel/model/tree',
        remove : '/metaModel/model/remove/{id}',
        save : '/metaModel/model/save/{id}',
        detail : '/metaModel/model/detail/{id}',
        importData : Dolphin.path.contextPath + '/metaModel/model/import',
        exportData : '/metaModel/model/export',

        attribute: '/metaModel/model/attribute',

        Attribute : {
            find : '/metaModel/attribute/find',
        }
    },

    _id : null,
    list : null,
    tree : null,
    editModal : null,

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

    thisPage.tree = new Dolphin.TREE({
        panel : "#dataTree",
        url : thisPage.url.tree,
        idField : '_id',
        title : '模型树',
        multiple: false,
        onChecked: function (node) {
            thisPage.showDetail(node);
        },
        onLoad: function () {
            if(thisPage._id){
                this.check(this.findById(thisPage._id), true);
            }
        }
    });

    thisPage.list = new Dolphin.LIST({
        panel : "#dataList",
        url : thisPage.url.attribute,
        data : {rows:[]},
        pagination: false,
        checkbox: false,
        columns : [{
            code: "name",
            title : "名称",
        },{
            code: "code",
            title : "编码",
        },{
            code: "type",
            title : "类型",
            formatter: function (val) {
                return Dolphin.enum.getEnumText('attributeBelong', val);
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

    thisPage.pickModal = new PickModal({
        selectedList:{
            url: thisPage.url.attribute,
            columns:[{
                code: "name",
                title : "名称",
            },{
                code: "code",
                title : "编码",
            },{
                code: "type",
                title : "类型",
                formatter: function (val) {
                    return Dolphin.enum.getEnumText('attributeBelong', val);
                }
            }]
        },
        unSelectList:{
            url: thisPage.url.Attribute.find
        },
        dataFilter:{
            checkUnSelect: function (data) {
                for(let i = 0; i < data.length; i++){
                    if(data[i].type === 'inherit'){
                        data.splice(i, 1);
                    }else{
                        i++;
                    }
                }
                return data;
            },
            select: function (data) {
                data.forEach(function (d) {
                    d.type = 'self';
                });
                return data;
            },
        },
        onShow: function () {
            let data = thisPage.list.data.rows;
            let ids = [];
            data.forEach(function (d) {
                ids.push(d._id);
            });

            this.selectedList.loadData(thisPage.list.data);
            this.unSelectList.query({_id:{'$nin':ids}});
        },
        onSubmit: function (data) {
            let node = thisPage.tree.getChecked()[0];
            let attributes = [];
            data.forEach(function (d) {
                if(d.type === 'self'){
                    attributes.push(d._id);
                }
            });

            Dolphin.ajax({
                url : thisPage.url.save,
                type : Dolphin.requestMethod.POST,
                data : Dolphin.json2string({attribute:attributes}),
                pathData : {id : node._id},
                onSuccess : function (reData) {
                    Dolphin.alert(reData.message, {
                        callback : function () {
                            thisPage._id = reData.data._id;
                            thisPage.tree.reload();
                            thisPage.showDetail(reData.data);
                        }
                    });
                }
            });
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

    //新增子节点
    $('#addChildrenData').click(function () {
        let checkedData = thisPage.tree.getChecked();
        if(checkedData.length != 1){
            Dolphin.alert("请选择一条数据");
        }else{
            let data = {
                parent: checkedData[0]._id,
                parentName: checkedData[0].name,
            };
            thisPage._id = "";
            Dolphin.form.setValue(data, thisPage.editForm);
            thisPage.editModal.modal('show');
        }
    });

    //修改
    $('#editDate').click(function () {
        let checkedData = thisPage.tree.getChecked();
        if(checkedData.length != 1){
            Dolphin.alert("请选择一条数据");
        }else{
            thisPage._id = checkedData[0]._id;
            let data = $.extend({}, checkedData[0]);
            if(data._parent){
                data.parentName = data._parent.name;
                data.parent = data.parent._id;
            }
            Dolphin.form.setValue(data, thisPage.editForm);
            thisPage.editModal.modal('show');
        }
    });

    //删除
    $('#removeDate').click(function () {
        let checkedData = thisPage.tree.getChecked();
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
                                        thisPage.tree.reload();
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
                        thisPage.tree.reload();
                        thisPage.showDetail(reData.data);
                        thisPage.editModal.modal('hide');
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
                    thisPage.tree.reload();
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

    thisPage.transferButton.click(function () {
        thisPage.pickModal.show();
    })
};

page.showDetail = function (node) {
    let thisPage = this;
    Dolphin.form.empty(thisPage.detailForm);
    Dolphin.form.setValue(node, thisPage.detailForm);
    thisPage.tree.expandTo(node);
    thisPage.list.query({id:node._id});
    Dolphin.toggleEnable(thisPage.transferButton, true);
};

page.formatterDate = function (val) {
    return Dolphin.date2string(new Date(Dolphin.string2date(val, "yyyy-MM-ddThh:mm:ss.").getTime() + 8 * 60 * 60 * 1000), "yyyy-MM-dd hh:mm:ss");
};
page.toggleEditState = function (state = 'detail', flag = false) {
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