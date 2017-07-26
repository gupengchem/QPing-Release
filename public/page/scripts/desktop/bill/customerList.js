'use strict';
$(function () {
    org.breezee.page = {
        init: function () {
            org.breezee.utils.loadCSS("/jquery-file-upload/css/jquery.fileupload.css", 1);
            org.breezee.utils.loadJS(["/jquery-file-upload/js/vendor/jquery.ui.widget.js",
                    "/jquery-file-upload/js/jquery.fileupload.js"],
                "/page/scripts/desktop/bill/_customerList.js");

            this.initDataList();
            this.initEvent();
            console.log('load the customerList.js....');
        },

        initEvent: function () {
            let me = this;

            $('.btn_add').click(function () {
                $('#dataModal').modal('show');
            });

            $('.btn_query').click(function () {
                me._dataList.load(null, Dolphin.form.getValue('#query_form'));
            });

            $('.btn_save').click(function () {
                let data = Dolphin.form.getValue('data_form');
                if (!me.selectData) {
                    delete data.parent;
                } else {
                    data.parent = {
                        id: me.selectData.id
                    };
                }
                data.category = data.category || '1';
                Dolphin.ajax({
                    url: '/api/742445c653654caaa4a1fa69eb651a9a',
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

            $('.btn_pay_save').click(function () {
                let formId = $(this).data('value'), msg = $(this).data('msg');
                let data = Dolphin.form.getValue(formId);
                console.log(data);

                Dolphin.ajax({
                    url: '/api/a9712abc45444611a652bf9b14ebd59e',
                    type: Dolphin.requestMethod.PUT,
                    data: Dolphin.json2string(data),
                    success: function (reData, textStatus) {
                        if (reData.success) {
                            $("#pay_message").html(msg);
                        } else {
                            $("#pay_message").html(reData.msg);
                        }
                    },
                    onError: function () {
                        $("#pay_message").html('系统出错，请联系管理员');
                    }
                });
            });

            $('#dataModal').on('hidden.bs.modal', function () {
                Dolphin.form.empty('#data_form');
                $("#error_message").empty();
            });
            $('#appConfigModal').on('hidden.bs.modal', function () {
                Dolphin.form.empty('#wepayForm');
                Dolphin.form.empty('#alipayForm');
                $("#pay_message").empty();
            });
        },

        initDataList: function () {
            let me = this;
            let typeName = ['集团客户', '分支机构', '门店站点'];
            me._dataList = new Dolphin.LIST({
                panel: "#dataList",
                idField: 'id',
                hover: false,
                columns: [{
                    code: 'name',
                    title: '客户名称',
                    formatter: function (val, row) {
                        let html = [];
                        for (let i = 1; i < row.pathNum; i++) {
                            html.push("&nbsp;&nbsp;&nbsp;&nbsp;")
                        }
                        html.push(val);
                        return html.join('');
                    }
                }, {
                    code: 'code',
                    title: '客户编码',
                    width: '150px'
                }, {
                    code: 'category',
                    title: '客户类型',
                    width: '160px',
                    formatter: function (val) {
                        return typeName[val];
                    }
                }, {
                    code: 'mobile',
                    title: '联系手机',
                    width: '150px',
                    className: "hide_el"
                }, {
                    code: 'person',
                    title: '联系人',
                    width: '180px',
                    className: "hide_el"
                }, {
                    code: 'industry',
                    title: '行业',
                    className: "hide_el"
                }, {
                    code: 'status',
                    title: '状态',
                    width: '75px',
                    formatter: function (val) {
                        if (val == 1) {
                            return "正常";
                        }
                        return "下线";
                    }
                }, {
                    code: 'id',
                    title: '&nbsp;',
                    width: '270px',
                    className: "hide_el",
                    formatter: function (val, row, index) {
                        return org.breezee.buttons.edit({
                                id: row.id
                            })
                            + '<a class="btn btn-outline btn-circle btn-sm green actBtn" data-id="' + val + '" href="javascript:;"><i class="fa fa-credit-card"></i> 商户配置</a>'
                            + org.breezee.buttons.del({id: row.id});
                    }
                }],
                multiple: false,
                rowIndex: true,
                checkbox: true,
                ajaxType: Dolphin.requestMethod.POST,
                url: '/api/742445c653654caaa4a1fa69eb651a9a',
                pagination: true,
                onChecked: function (data) {
                    console.log(data);
                    me.selectData = data;
                },
                onLoadSuccess: function () {
                    org.breezee.buttons.editCallback('1423c7225d134248944babc34f3a36f4', 'id', function (data) {
                        if (data.value.customerId)
                            $("#customerId").val(data.value.customerId);
                        $('#dataModal').modal('show');
                    });
                    org.breezee.buttons.delCallback('1423c7225d134248944babc34f3a36f4', function (data) {
                        $('.btn_query').click();
                    });

                    $(".actBtn").click(function () {
                        let cusId = $(this).data('id');
                        $(".payCustomerId").val(cusId);
                        Dolphin.ajax({
                            url: '/api/6d266ae6d94d40098fdb0ee9df364c46@customerId=' + cusId,
                            type: Dolphin.requestMethod.GET,
                            onSuccess: function (reData) {
                                if (reData && reData.rows) {
                                    $.each(reData.rows, function () {
                                        console.log(this);
                                        if (this.type == 'wepay') {
                                            Dolphin.form.setValue(this, '#wepayForm');
                                        } else if (this.type == 'alipay') {
                                            Dolphin.form.setValue(this, '#alipayForm');
                                        }
                                    });
                                }
                            }
                        });
                        $("#appConfigModal").modal('show');
                    });
                }
            });
        }
    };
});