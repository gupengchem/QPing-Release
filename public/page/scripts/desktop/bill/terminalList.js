'use strict';
$(function () {
    org.breezee.page = {
        init: function () {
            org.breezee.utils.loadJS(["/js/libs/select2.min.js"],"/pages/_terminalLoad.js");

            this.initEvent();
            this.initDataList();
            console.log('load the terminalList.js....');
        },

        initEvent: function () {
            let me = this;
            //新增窗口弹出
            $('.btn_add').click(function () {
                console.log('add button click....');
                $('#dataModal').modal('show');
            });

            $('.btn_query').click(function () {
                me._dataList.load(null, Dolphin.form.getValue('#query_form'));
            });

            $('.btn_save').click(function () {
                let data = Dolphin.form.getValue('data_form');
                Dolphin.ajax({
                    url: '/api/8d3537676e2043848c0e36ff2d80a653',
                    type: Dolphin.requestMethod.PUT,
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
            let typeName = ['POS', '移动'];
            me._dataList = new Dolphin.LIST({
                panel: "#dataList",
                idField: 'id',
                hover: false,
                columns: [{
                    code: 'code',
                    title: '终端编号',
                    width: '150px'
                }, {
                    code: 'name',
                    title: '终端名称'
                }, {
                    code: 'type',
                    title: '终端类型',
                    width: '160px',
                    formatter: function (val) {
                        return typeName[val];
                    }
                }, {
                    code: 'sn',
                    title: '序列号',
                    width: '150px',
                    className: "hide_el"
                }, {
                    code: 'customerName',
                    title: '客户名称',
                    className: "hide_el"
                }, {
                    code: 'id',
                    title: '&nbsp;',
                    width: '170px',
                    className: "hide_el",
                    formatter: function (val, row, index) {
                        return org.breezee.buttons.edit({
                                id: row.id
                            }) + org.breezee.buttons.del({id: row.id});
                    }
                }],
                multiple: true,
                rowIndex: true,
                checkbox: false,
                ajaxType: Dolphin.requestMethod.POST,
                url: '/api/8d3537676e2043848c0e36ff2d80a653',
                pagination: true,
                onLoadSuccess: function () {
                    org.breezee.buttons.editCallback('56234bc2c020406481ed04777a2a555d', 'id', function (data) {
                        if (data.value.customerId)
                            $("#customerId").val(data.value.customerId);
                        $('#dataModal').modal('show');
                    });
                    org.breezee.buttons.delCallback('56234bc2c020406481ed04777a2a555d', function (data) {
                        $('.btn_query').click();
                    });
                }
            });
        }
    };
});