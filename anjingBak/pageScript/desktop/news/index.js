/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved. 
 */

$(function () {
    org.breezee.menu.topSelect('news');

    org.breezee.page = {

        init: function () {
            this.categoryTree();
            this.itemLine();
            this.initEvent();
        },

        initEvent: function () {
            var me = this;
            $('.add_new').click(function () {
                $('#myModal').modal('show');
            });

            $('.modelSave').click(function () {
                var data = Dolphin.form.getValue('categoryForm', '"');
                Dolphin.ajax({
                    url: '/api/6afc0d04df00417f9251f2068fd3fb3e',
                    type: Dolphin.requestMethod.PUT,
                    data: Dolphin.json2string(data),
                    onSuccess: function (reData) {
                        Dolphin.alert(reData.msg || '保存成功', {
                            callback: function () {
                                me._categoryTree.reload();
                                $('#myModal').modal('hide');
                            }
                        })
                    }
                });
            });

            $("#articleAdd").bind('click', function () {
                location.href = "news-edit-modal?modelId=" + me.selectNode['id'];
            });

            $("#articleUpdate").click(function () {
                if (me.curSelect) {
                    location.href = "news-edit-modal?modelId=" + me.selectNode['id'] + "&id=" + me.curSelect.id;
                } else {
                    Dolphin.alert('请选择一条记录。');
                }
            });

            $('#articleDel').bind('click', function () {
                Dolphin.ajax({
                    url: "/api/44f68abae4874b2e92846b9bf5cce3e2@id=" + me.curSelect.id,
                    type: Dolphin.requestMethod.DELETE,
                    onSuccess: function (reData) {
                        Dolphin.alert('删除成功', {
                            callback: function () {
                                me._itemList.reload();
                            }
                        })
                    }
                });
            });
        },

        categoryTree: function () {
            var me = this;
            this._categoryTree = new Dolphin.TREE({
                panel: '#categoryTree',
                url: '/api/e91244a3044e49c6af69c423f908b097',
                mockPathData: ['id'],
                multiple: false,
                onChecked: function (data) {
                    me.selectNode = data;
                    me._itemList.query({
                        model_id_obj_ae: data.id
                    });
                }
            });
        },

        itemLine: function () {
            var me = this;
            this._itemList = new Dolphin.LIST({
                panel: '#itemList',
                url: '/api/c97b00aa70fc4ed1b5922bced4468a0b',
                ajaxType: 'post',
                mockPathData: ['id'],
                data: {rows: [], total: 0},
                pagination: true,
                multiple: false,
                columns: [{
                    code: 'name',
                    title: '标题'
                }, {
                    code: 'subtitle',
                    title: '封面图片'
                }, {
                    code: 'lang',
                    title: '语言',
                    formatter: function (value, record) {
                        return "中文";
                    }
                }, {
                    code: 'updator',
                    title: '更新人'
                }, {
                    code: 'updateTime',
                    title: '更新时间'
                }, {
                    code: 'content',
                    title: '详情',
                    formatter: function (value, record) {
                        return '<a href="news-detail-modal?id=' + record.id + '" target="_blank">详情</a>';
                    }
                }],
                onLoadSuccess: function (data) {
                },
                onCheck: function (data, row, thisInput) {
                },
                onChecked: function (data, row, thisCheckbox) {
                    me.curSelect = data;
                },
                onUnchecked: function (data) {
                }
            });
        }
    };

    org.breezee.page.init();
});