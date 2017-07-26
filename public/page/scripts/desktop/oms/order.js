'use strict';
$(function () {
    org.breezee.page = {
        init: function () {
            org.breezee.utils.loadJS(["/assets/js/moment.min.js", "/assets/js/daterangepicker.min.js"],
                "/page/scripts/desktop/asyncLoad.js?_token=" + new Date().getTime());
            this.initEvent();
            this.initDataList();
            this.lineData();
            this.paymentData();
            console.log('load the materielList.js....');

            Dolphin.form.parse("#data_form");
        },

        initEvent: function () {
            let me = this;

            $('.btn_query').click(function () {
                me._dataList.load(null, Dolphin.form.getValue('#query_form'));
            });

            $('.btn_save').click(function () {
                let data = Dolphin.form.getValue('#data_form');
                console.log("materiel", data);
                data.dayCheck = !!data.dayCheck;
                data.weekCheck = !!data.weekCheck;
                data.monthCheck = !!data.monthCheck;
                Dolphin.ajax({
                    url: '/api/f4cd29f771044f2d8d90d33b238fd371',
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
            me._dataList = new Dolphin.LIST({
                panel: "#dataList",
                idField: 'id',
                hover: false,
                columns: [{
                    code: 'happenTime',
                    title: '交易时间',
                    width: '150px',
                    formatter: function (val, row) {
                        return val;
                    }
                }, {
                    code: 'name',
                    title: '门店信息',
                    width: '100px',
                    className: "hide_el",
                    formatter: function (val, row) {
                        return val?val:'门店编码'+row.shopCode+'不存在';
                    }
                }, {
                    code: 'code',
                    title: '订单号',
                    className: "hide_el",
                    width: '130px',
                    formatter: function (val, row) {
                        return val+' - <span style="font-size: 85%;">'+row.billNo+'</span>';
                    }
                }, {
                    code: 'userId',
                    title: '会员名称',
                    className: "hide_el",
                    width: '100px',
                    formatter: function (val, row) {
                        return val || '散客';
                    }
                }, {
                    code: 'period',
                    title: '餐段',
                    className: "hide_el",
                    width: '70px',
                    formatter: function (val, row) {
                        return val;
                    }
                }, {
                    code: 'brand',
                    title: '品牌',
                    className: "hide_el",
                    width: '70px',
                    formatter: function (val, row) {
                        return val;
                    }
                }, {
                    code: 'method',
                    title: '销售方式',
                    className: "hide_el",
                    width: '90px',
                    formatter: function (val, row) {
                        return val;
                    }
                }, {
                    code: 'totalAmount',
                    title: '金额￥',
                    width: '270px',
                    formatter: function (val, row) {
                        let html = [];
                        html.push('<span>总金额: ');
                        html.push(row.totalAmount);
                        html.push('元</span><span>， 优惠额: ');
                        html.push(row.disAmount || 0);
                        html.push('元</span>');
                        html.push('<span>， 扣减额: ');
                        html.push(row.deductAmount);
                        html.push('元</span>');

                        html.push('<br/><span> 实收: ');
                        html.push(row.subAmount);
                        html.push('元</span>');

                        return html.join('');
                    }
                }, {
                    code: 'id',
                    title: '&nbsp;',
                    className: "hide_el",
                    textAlign:'center',
                    width: '90px',
                    formatter: function (val, row, index) {
                        return org.breezee.buttons.view({
                            id: row.id
                        });
                    }
                }],
                multiple: false,
                rowIndex: true,
                checkbox: false,
                ajaxType: Dolphin.requestMethod.POST,
                url: '/api/7b5e3f88ed474fe4a9b356bd7c681626',
                pagination: true,
                onLoadSuccess: function (data) {
                    if (data.value) {
                        $('#totalSum').html(data.value.total);
                        $('#feeSum').html(data.value.charge);
                    }
                    $(".viewBtn").click(function () {
                        let id = $(this).data('id');
                        Dolphin.ajax({
                            url: '/api/979fbfff19034a978f6fc344f8d7b956@id=' + id,
                            type: Dolphin.requestMethod.GET,
                            onSuccess: function (reData) {
                                console.log($("#order-form").find("[name=happenTime]"));
                                reData.value.periodName = Dolphin.enum.getEnumText('posPeriod',reData.value.period);
                                reData.value.methodName = Dolphin.enum.getEnumText('saleMethod',reData.value.method);
                                reData.value.brandName = Dolphin.enum.getEnumText('brandName',reData.value.brand);
                                Dolphin.form.setValue(reData.value, '#order-form');
                                me._dataLineList.loadData({rows:reData.value.orderLines});
                                me._payementList.loadData({rows:reData.value.payments});
                                $('#dataModal').modal('show');
                            }
                        });
                    });
                }
            });
        },

        paymentData: function () {
            this._payementList = new Dolphin.LIST({
                panel: "#paymentData",
                idField: 'id',
                hover: false,
                columns: [{
                    code: 'name',
                    title: '支付方式',
                    width: '140px',
                    formatter: function (val, row) {
                        return row.payCode+'-'+val;
                    }
                }, {
                    code: 'payAmount',
                    title: '支付金额',
                    width: '100px',
                    textAlign:'right',
                    className: "hide_el",
                    formatter: function (val, row) {
                        return val && val.toFixed(2);
                    }
                }, {
                    code: 'quantity',
                    title: '券编码',
                    className: "hide_el",
                    width: '130px',
                    formatter: function (val, row) {
                        return val;
                    }
                }, {
                    code: 'salePrice',
                    title: '支付机构',
                    className: "hide_el",
                    width: '120px',
                    formatter: function (val, row) {
                        return val || '散客';
                    }
                }, {
                    code: 'totalAmount',
                    title: '承担客户',
                    className: "hide_el",
                    formatter: function (val, row) {
                        return val;
                    }
                }],
                multiple: false,
                rowIndex: true,
                checkbox: false,
                data: {rows: []},
                pagination: false,

            });
        },

        lineData: function () {
            this._dataLineList = new Dolphin.LIST({
                panel: "#lineData",
                idField: 'id',
                hover: false,
                columns: [{
                    code:'type',
                    title:'业务类型',
                    width:'75px',
                    formatter:function (val,row) {
                        return Dolphin.enum.getEnumText('orderLineType',val);
                    }
                },{
                    code: 'name',
                    title: '菜品描述',
                    formatter: function (val, row) {
                        return row.productCode+'-'+val;
                    }
                }, {
                    code: 'comboType',
                    title: '套餐标识',
                    width: '90px',
                    className: "hide_el",
                    textAlign:'center',
                    formatter: function (val, row) {
                        return (val&& (val==1 || val==2))?row.productCode:'-';
                    }
                }, {
                    code: 'comboCode',
                    title: '套餐编码',
                    width: '100px',
                    className: "hide_el",
                    formatter: function (val, row) {
                        return val;
                    }
                },{
                    code: 'quantity',
                    title: '数量',
                    className: "hide_el",
                    width: '75px',
                    formatter: function (val, row) {
                        return val;
                    }
                }, {
                    code: 'salePrice',
                    title: '单价',
                    className: "hide_el",
                    width: '75px',
                    formatter: function (val, row) {
                        return val || '散客';
                    }
                }, {
                    code: 'totalAmount',
                    title: '合计',
                    className: "hide_el",
                    width: '100px',
                    formatter: function (val, row) {
                        return val;
                    }
                }, {
                    code: 'disAmount',
                    title: '行折扣',
                    className: "hide_el",
                    width: '90px',
                    formatter: function (val, row) {
                        return val;
                    }
                }, {
                    code: 'disAmount',
                    title: '分摊折扣',
                    className: "hide_el",
                    width: '90px',
                    formatter: function (val, row) {
                        return val;
                    }
                }, {
                    code: 'subAmount',
                    title: '净额',
                    width: '75px'
                }],
                multiple: false,
                rowIndex: true,
                checkbox: false,
                data: {rows: []},
                pagination: false,

            });
        }
    };
});
