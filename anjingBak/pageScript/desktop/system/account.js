'use strict';
$(function () {
    org.breezee.page = {
        init: function () {
            this.initEvent();
            this.initDataList();
            console.log('load the accountList.js....');
        },

        initEvent: function () {
            let me = this;
            //新增窗口弹出
            $('.btn_add').click(function () {
                console.log('add button click....');
                $('#dataModal').modal('show');
            });

            $('.btn_query').click(function () {
                me._dataList.load("/auth/accounts", {properties:Dolphin.form.getValue('#query_form')});
            });

            $('.btn_save').click(function () {
                let data = Dolphin.form.getValue('#data_form');
                console.log(data);
                Dolphin.ajax({
                    url: '/auth/save',
                    type: Dolphin.requestMethod.POST,
                    data: Dolphin.json2string(data),
                    success: function (reData, textStatus) {
                        if (reData.success) {
                            $('.btn_query').click();
                            $('#dataModal').modal('hide');
                        } else {
                            $("#error_message").html(reData.msg);
                        }
                    },
                    onError: function () {
                        $("#error_message").html('系统出错，请联系管理员');
                    }
                });
            });

            $('#dataModal').on('hidden.bs.modal', function () {
                Dolphin.form.empty('#data_form');
                $("#error_message").empty();
            })
        },

        initDataList: function () {
            let me = this;
            me._dataList = new Dolphin.LIST({
                panel: "#dataList",
                idField: 'id',
                hover: false,
                columns: [{
                    code: 'code',
                    title: '账号编码',
                    width: '150px'
                }, {
                    code: 'name',
                    title: '账号名称'
                }, {
                    code: 'mobile',
                    title: '联系手机',
                    width: '150px',
                    className: "hide_el"
                }, {
                    code: 'email',
                    title: '电子邮件',
                    width: '180px',
                    className: "hide_el"
                }, {
                    code: 'statusName',
                    title: '状态',
                    width: '90px',
                    className: "hide_el",
                    formatter:function (val, row) {
                        if(row.delFlag){
                            return "已删除";
                        }
                        return val;
                    }
                }, {
                    code: 'id',
                    title: '&nbsp;',
                    width: '170px',
                    className: "hide_el",
                    formatter: function (val, row, index) {
                        if(row.delFlag){

                        } else {
                            return org.breezee.buttons.edit({
                                    id: row.id
                                }) + org.breezee.buttons.del({id: row.id});
                        }
                    }
                }],
                multiple: true,
                rowIndex: true,
                checkbox: true,
                ajaxType: Dolphin.requestMethod.POST,
                url: '/api/39f139515f18427984e8774c59ba727b',
                pagination: true,
                onLoadSuccess: function () {
                    org.breezee.buttons.editCallback('25274ec2bcc14367be8e57c1f10a58b1','id',function (data) {
                        $('#dataModal').modal('show');
                    });
                    org.breezee.buttons.delCallback('/auth/delete/:str', function (data) {
                        $('.btn_query').click();
                    });
                }
            });
        }
    };
});