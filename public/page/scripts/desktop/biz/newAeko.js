"use strict";
$(function () {
    org.breezee.page = {
        init: function () {
            let me = this;
            Dolphin.form.parse();
            this.initEvent();
        },
        initEvent:function () {
            //初始化
            if(org.breezee.context.queryData.id){
                Dolphin.ajax({
                    url: "/api/88f533f6186b47c1a7c348cab1835c39@id=" + org.breezee.context.queryData.id,
                    type: Dolphin.requestMethod.GET,
                    onSuccess: function (reData) {
                        Dolphin.form.setValue(reData.value, '#data_form');
                    }
                });
            }
            $("#submitBtn").click(function () {
                let data = Dolphin.form.getValue('#data_form');
                Dolphin.confirm('确认提交此信息只下一节点吗？', {
                    callback: function (flag) {
                        if (flag) {
                            Dolphin.ajax({
                                url: '/api/95d7cd8d08884789841d354411849ba7',
                                type: Dolphin.requestMethod.POST,
                                loading:true,
                                data: Dolphin.json2string({
                                    processDefinitionId: 'aekoApply',
                                    businessKey: data.code,
                                    properties: {
                                        action:data.action || 'other',
                                        startUser: 'anjing',
                                        optDesc: '提交测试流程信息',
                                        optReason:'提交'
                                    }
                                }),
                                onSuccess: function (reData) {
                                    Dolphin.goUrl('/task/finished');
                                }
                            });
                        }
                    }
                });
            });
            $("#saveDraftBtn").click(function () {
                let data = Dolphin.form.getValue('#data_form');
                Dolphin.confirm('确认保存为草稿，以便下次编辑？', {
                    callback: function (flag) {
                        if (flag) {
                            Dolphin.ajax({
                                url: '/api/b131c5660a694b8e8dbb9ae54247af85',
                                type: Dolphin.requestMethod.PUT,
                                loading:true,
                                data: Dolphin.json2string(data),
                                onSuccess: function (reData) {
                                    Dolphin.goUrl('/task/draft');
                                }
                            });
                        }
                    }
                });
            });
        }
    }
});


