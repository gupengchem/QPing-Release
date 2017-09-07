/**
* Created by wangshuyi on 8/8/2017, 2:04:11 PM.
*/

'use strict';
const page = {
    editForm : $('#edit-form'),
    detailForm : $('#detail-form'),
    queryConditionForm: $('#queryConditionForm'),
    transferButton: $('#transfer'),

    url : {
        list : '/system/auth/org/find',
        tree : '/system/auth/org/tree',
        remove : '/system/auth/org/remove/{id}',
        save : '/system/auth/org/save/{id}',
        detail : '/system/auth/org/detail/{id}',
        importData : Dolphin.path.contextPath + '/system/auth/org/import',
        exportData : '/system/auth/org/export',
        updateUser : '/system/auth/org/updateUser',

        user: {
            list : '/system/auth/user/list',
        }
    },

    _id : null,
    list : null,
    tree : null,
    editModal : null,
    pickModal : null,

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
        title : '组织树',
        multiple: false,
        nameField: function (data) {
            return data.name + "【" + data.code + "】";
        },
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
        url : thisPage.url.user.list,
        data : {rows:[]},
        pagination: false,
        checkbox: false,
        queryParams : Dolphin.form.getValue('queryConditionForm'),
        columns : [{
            code: "name",
            title : "名称",
        },{
            code: "code",
            title : "编码",
        },{
            code: "phone",
            title : "手机号",
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
            url: thisPage.url.user.list,
            columns: [
                {title:'名称', code: 'name'},
                {title:'原组织', code: 'org.name'},
            ]
        },
        unSelectList:{
            url: thisPage.url.user.list,
            columns: [
                {title:'名称', code: 'name'},
                {title:'原组织', code: 'org.name'},
            ]
        },
        dataFilter:{
            checkUnSelect: function (data) {
                return data;
            },
            select: function (data) {
                return data;
            },
        },
        onShow: function () {
            let node = thisPage.tree.getChecked()[0];

            this.selectedList.query({org: node._id});
            this.unSelectList.query({org:{'$ne':node._id}});
        },
        onSubmit: function (data, unData) {
            let node = thisPage.tree.getChecked()[0], i;
            let _data = {org: node._id, addUser:[], removeUser:[]};
            data.forEach(function (d) {
                if(!d.org || d.org._id !== node._id){
                    _data.addUser.push(d._id);
                }
            });
            unData.forEach(function (d) {
                if(d.org && d.org._id === node._id){
                    _data.removeUser.push(d._id);
                }
            });

            Dolphin.ajax({
                url : thisPage.url.updateUser,
                type : Dolphin.requestMethod.POST,
                data : Dolphin.json2string(_data),
                pathData : {id : node._id},
                onSuccess : function (reData) {
                    Dolphin.alert(reData.message, {
                        callback : function () {
                            thisPage.list.reload();
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
                        thisPage.showDetail(reData.data._id);
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
    });
};

page.showDetail = function (node) {
    let thisPage = this;
    Dolphin.form.empty(thisPage.detailForm);
    Dolphin.form.setValue(node, thisPage.detailForm);
    thisPage.tree.expandTo(node);
    thisPage.list.query({org:node._id});
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