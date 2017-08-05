/**
* Created by wangshuyi on 5/22/2017, 3:13:44 PM.
*/

'use strict';
const page = {
    editForm : $('#edit-form'),
    detailForm : $('#detail-form'),
    queryConditionForm: $('#queryConditionForm'),

    url : {
        list : '/system/auth/role/list',
        remove : '/system/auth/role/remove/{id}',
        save : '/system/auth/role/save/{id}',
        detail : '/system/auth/role/detail/{id}',
        importData : Dolphin.path.contextPath + '/system/auth/role/import',
        exportData : '/system/auth/role/export',

        menu : {
            tree: '/system/menu/tree',
        }
    },

    _id : null,
    list : null,
    tree : null,

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
        title : "角色列表",
        queryParams : Dolphin.form.getValue('queryConditionForm'),
        columns : [{
                code: "name",
                title : "名称",
            },{
                code: "code",
                title : "编码",
            },{
                code: "menus",
                title : "可见菜单",
                width: '50%',
                formatter: function (val) {
                    let result = $('<div>');
                    val.forEach(function (subject, i) {
                        if(i > 0){
                            result.append('、');
                        }
                        result.append(subject.name);
                    });

                    return result;
                }
            }
        ],
        onClick: function (data) {
            thisPage.showDetail(data._id);
        },
        onLoadSuccess: function () {
            if(thisPage._id){
                this.check(thisPage._id, true);
            }
        }
    });

    thisPage.tree = new Dolphin.TREE({
        panel : "#dataTree",
        url : thisPage.url.menu.tree,
        idField : '_id',
        title : '科目树',
        cascadeCheck : false,
        checkboxName : 'menus',
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
    });

    //修改
    $('#editDate').click(function () {
        let checkedData = thisPage.list.getChecked();
        if(checkedData.length != 1){
            Dolphin.alert("请选择一条数据");
        }else{
            thisPage._id = checkedData[0]._id;
            thisPage.toggleEditState('edit');

            Dolphin.form.setValue(checkedData[0], thisPage.editForm);
            checkedData[0].menus.forEach(function (menu) {
                let node = thisPage.tree.findById(menu._id);
                thisPage.tree.check(node);
            });
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
};

page.showDetail = function (_id) {
    let thisPage = this;
    Dolphin.ajax({
        url : thisPage.url.detail,
        pathData : {id : _id},
        //loading : true,
        onSuccess : function (reData) {
            thisPage.toggleEditState(null, true);

            reData.data._menus = "";
            reData.data.menus.forEach(function (menu, i) {
                if(i > 0){
                    reData.data._menus += '、';
                }
                reData.data._menus += menu.name;
            });

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
        Dolphin.toggleCheck($(thisPage.tree.opts.panel).find('input[type="checkbox"]'), false);
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
    Menu.select("Role");
    page.init();
});