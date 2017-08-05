/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved.
 */

"use strict";
$(function () {
    org.breezee.page = {
        init: function () {
            let me = this;
            me._dataList = me.dataList('#dataList');
            this.initEvent();
        },

        initEvent: function () {
            let me = this;

            $('.btn-query').click(function () {
                let d = Dolphin.form.getValue('.query-form');
                me._dataList.reload(null,d);
            });
        },

        dataList: function (panelId, status, split) {
            return new Dolphin.LIST({
                panel: panelId,
                queryParams: {
                    createUser: 'anjing'
                },
                idField: 'id',
                columns: [{
                    code: 'id',
                    title: '任务标示',
                    width: '100px',
                    formatter: function (val, row) {
                        return val;
                    }
                }, {
                    code: 'processDefinitionName',
                    title: '流程名称',
                    width: '150px',
                    formatter: function (val, row) {
                        return val;
                    }
                },{
                    code: 'name',
                    title: '任务名称',
                    width: '150px',
                    formatter: function (val, row) {
                        return val;
                    }
                }, {
                    code: 'businessKey',
                    title: '单据编码',
                    width: '120px'
                }, {
                    code: 'taskObject.statusName',
                    title: '单据状态',
                    width: '180px'
                },{
                    code: 'createTime',
                    title: '任务时间',
                    width: '160px'
                }, {
                    code: 'id',
                    title: '&nbsp;',
                    width: '100px',
                    formatter: function (val, row, index) {
                        return org.breezee.buttons.view({
                            id: row.id + '@' + row.processInstanceId + '@' + row.processDefinitionId
                        });
                    }
                }],
                multiple: true,
                rowIndex: false,
                checkbox: true,
                ajaxType: Dolphin.requestMethod.POST,
                url: '/api/37ffa8eb5ba744d4975b38badf21a0f0',
                pagination: true,
                onLoadSuccess: function () {
                    $(".viewBtn").click(function () {
                        let tmp = $(this).data('id').split('@');
                    });
                }
            });
        }
    };
});