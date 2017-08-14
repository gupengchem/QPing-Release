/**
* Created by wangshuyi on 8/14/2017, 9:34:43 AM.
*/

'use strict';
const page = {
    editForm : $('#edit-form'),
    detailForm : $('#detail-form'),
    queryConditionForm: $('#queryConditionForm'),

    url : {
        list : '/metaModel/product/list',
        remove : '/metaModel/product/remove',
        importData : Dolphin.path.contextPath + '/metaModel/product/import',
        exportData : '/metaModel/product/export',

        Model : {
            tree : '/metaModel/model/tree',
        }
    },

    _id : null,
    tree : null,
    list : null,

    init: null,
    initElement: null,
    initEvent: null,
    formatterDate: null,
};

page.init = function () {
    page.initElement();
    page.initEvent();
};

page.initElement = function () {
    const thisPage = this;
    Dolphin.form.parse();

    thisPage.tree = new Dolphin.TREE({
        panel : "#modelTree",
        url : thisPage.url.Model.tree,
        idField : '_id',
        title : '模型树',
        multiple: false,
        onChecked: function (node) {
            let ids = [];
            let getAll = function (n) {
                ids.push(n._id);
                if(n.children){
                    n.children.forEach(function (c) {
                        getAll(c);
                    })
                }
            };
            getAll(node);
            thisPage.list.query({model: {$in: ids}});
        },
        onLoad: function () {

        }
    });

    thisPage.list = new Dolphin.LIST({
        panel : "#datalist",
        url : thisPage.url.list,
        title : "产品列表",
        queryParams : Dolphin.form.getValue('queryConditionForm'),
        columns : [{
            code: "name",
            title : "名称",
            
        },{
            code: "code",
            title : "编码",
            
        },{
            code: "model.name",
            title : "所属模型",
            
        }]
    });
};


page.initEvent = function () {
    const thisPage = this;

    //查询
    thisPage.queryConditionForm.submit(function () {
        thisPage.list.query($.extend(thisPage.list.opts.queryParams, Dolphin.form.getValue('queryConditionForm')));
        return false;
    });

    //新增
    $('#addData').click(function () {
        let node = thisPage.tree.getChecked();
        if(node.length > 0){
            Dolphin.goUrl(`/metaModel/productEdit?model=${node[0]._id}`);
        }else{
            Dolphin.alert('请选择一个模型');
        }
    });

    //修改
    $('#editDate').click(function () {
        let data = thisPage.list.getChecked();
        if(data.length != 1){
            Dolphin.alert("请选择一条数据");
        }else{
            Dolphin.goUrl(`/metaModel/productEdit?model=${data[0].model._id}&id=${data[0]._id}`);
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