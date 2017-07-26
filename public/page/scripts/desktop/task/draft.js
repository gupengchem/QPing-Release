/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved.
 */

"use strict";
$(function () {
    org.breezee.page = {
        init: function () {
            this._dataList = this.dataList('#dataList');
            this.initEvent();
        },

        initEvent: function () {
            let me = this;
            $('.btn-query').click(function () {
                let d = Dolphin.form.getValue('.query-form');
                me._dataList.reload(null, d);
            });
        },

        dataList: function (panelId, status, split) {
            let me = this;
            return new Dolphin.LIST({
                panel: panelId,
                idField: 'id',
                columns: [{
                    code: 'id',
                    title: '主键',
                    width: '100px',
                    formatter: function (val, row) {
                        return val;
                    }
                }, {
                    code: 'code',
                    title: 'code',
                    width: '150px'
                }, {
                    code: 'name',
                    title: '名称',
                    width: '150px',
                    formatter: function (val, row) {
                        return val;
                    }
                }, {
                    code: 'createTime',
                    title: '创建时间',
                    width: '120px'
                }, {
                    code: 'creator',
                    title: '创建人',
                    width: '180px'
                }, {
                    code: 'id',
                    title: '&nbsp;',
                    width: '100px',
                    formatter: function (val, row, index) {
                        return org.breezee.buttons.del({
                            id: row.id
                        })
                            +  '<a href="javascript:;" class="btn btn-outline btn-sm blue btn-edit"'
                            + ' data-id="' + row.id + '"><i class="fa fa-legal"></i>编辑</a> ';
                    }
                }],
                multiple: true,
                rowIndex: false,
                checkbox: true,
                ajaxType: Dolphin.requestMethod.POST,
                url: '/api/b131c5660a694b8e8dbb9ae54247af85',
                pagination: true,
                onLoadSuccess: function () {
                    $('.btn-edit').click(function () {
                        var el = $(this);
                        Dolphin.goUrl('/biz/newAeko?id='+el.data().id);
                    });
                    org.breezee.buttons.delCallback('88f533f6186b47c1a7c348cab1835c39', function () {
                        me._dataList.reload();
                    });
                }
            });
        }
    };
});