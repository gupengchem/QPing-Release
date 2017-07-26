/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved.
 */

"use strict";
$(function () {
    org.breezee.page = {
        init: function () {
            let me = this;
            // me._dataList = me.dataList('#dataList');
            this.initEvent();
            me.curTaskId;
        },

        initEvent: function () {
            let me = this;

            $('.btn-query').click(function () {
                let d = Dolphin.form.getValue('.query-form');
                me._dataList.reload(null, d);
            });
            $(".task").click(function () {
                $(".task").removeClass('active');
                $(this).addClass('active');
                $("#timeline").load('historyNode?id=' + $(this).data('bizid'));
                let img = $("#wfimage");
                img.attr('src', img.data('url') + '@procsInsId=' + $(this).data('prnid') + '?prcsDefId=' + $(this).data('prcsdef') + '&bizId=' + $(this).data('bizid') + '&__image__=1');
                me.curTaskId = $(this).data('id');
                console.log(me.curTaskId);
                $("#btnopergroup").show();
            }).dblclick(function () {
                Dolphin.goUrl('/task/taskDetail?id=' + $(this).data('id'));
            });

            const STATUS_NAME = {
                rollback: '驳回',
                delete: '拒绝',
                uploaded: '上传',
                approve: '通过',
                back: '退回'
            };

            $(".btn-oper").click(function () {
                if (!me.curTaskId) {
                    Dolphin.alert('请选择一个任务');
                    return;
                }
                let da = $(this);
                Dolphin.prompt("审批意见", {
                    type: 'textarea',
                    title: '确认<b style="color: #8b0000;">' + STATUS_NAME[da.data('action')] + "</b>所选择的活动申请吗",
                    textClass: 'approveText',
                    callback: function (flag) {
                        if (flag !== null) {
                            Dolphin.ajax({
                                url: '/api/00b5f7f9915f456f935de39f419ec641',
                                type: Dolphin.requestMethod.POST,
                                loading:true,
                                data: Dolphin.json2string({
                                    id: me.curTaskId,
                                    properties: $.extend({
                                        optDesc: flag,
                                        createUser: org.breezee.context.userData.userCode,
                                        action:da.data('action')
                                    }, da.data())
                                }),
                                onSuccess: function (data) {
                                    location.reload(true);
                                }
                            });
                        }
                    }
                });
            });
        },

        dataList: function (panelId, status, split) {
            return new Dolphin.LIST({
                panel: panelId,
                queryParams: {
                    pageSize: 9999,
                    assignee: org.breezee.context.userData.userCode
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
                    code: 'processDefinitionKey',
                    title: '流程名称',
                    width: '150px',
                    formatter: function (val, row) {
                        return Dolphin.enum.getEnumText('processDef', val);
                    }
                }, {
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
                }, {
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
                url: '/api/a95f7a0ee3944c09bec8099c7b4c85bc',
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