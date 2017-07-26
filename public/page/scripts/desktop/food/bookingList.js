'use strict';
$(function () {
    org.breezee.page = {
        init: function () {
            this.initDataList();
            this.initEvent();
            console.log('load the dealdetail.js....');
            $('.btn_query').click();
        },

        initEvent: function () {
            let me = this;

            $('.btn_sync').click(function () {
                $('#dataModal').modal('show');
            });

            $('.btn_download').click(function () {
                let data = Dolphin.form.getValue('data_form');
                console.log(data);
                Dolphin.ajax({
                    url: '/sync',
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

            $('.btn_query').click(function () {
                let data = Dolphin.form.getValue('query_form');
                if (data.daterange) {
                    data._happenTime_gt = data.daterange.substr(0, 4) + '-' + data.daterange.substr(4, 2) + '-' + data.daterange.substr(6, 2) + ' 00:00:00';
                    data._happenTime_le = data.daterange.substr(11, 4) + '-' + data.daterange.substr(15, 2) + '-' + data.daterange.substr(17, 2) + ' 23:59:59';
                }
                if (data.totalAmount_gt)
                    data.totalAmount_gt = Number(data.totalAmount_gt);
                if (data.totalAmount_le)
                    data.totalAmount_le = Number(data.totalAmount_le);
                me._dataList.load(null, data);
            });

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
                    width: '160px',
                    formatter: function (val, row) {
                        let html = [];
                        html.push('<div>');
                        html.push(val);
                        html.push('</div><div>');
                        html.push(row.payMethod);
                        if (row.refundId == '0' || !row.refundId) {
                            html.push('付款');
                        } else {
                            html.push('退款');
                        }
                        html.push('</div>');
                        return html.join('');
                    }
                }, {
                    code: 'mchId',
                    title: '客户信息',
                    className: "hide_el",
                    width: '250px',
                    formatter:function (val,row) {
                        let html = [];
                        html.push('<div>');
                        html.push(row.customerName);
                        html.push('</div>');
                        html.push('<div style="font-size: 90%;">');
                        if(row.payMethod === '微信') {
                            html.push('商户号:');
                            html.push(val);
                        } else {
                            html.push('门店号:');
                            html.push(row.shopId);
                        }
                        html.push(",设备号:");
                        html.push(row.deviceId);
                        html.push('</div>');
                        return html.join('');
                    }
                }, {
                    code: '',
                    title: '订单号',
                    className: "hide_el",
                    width:'320px',
                    formatter: function (val, row) {
                        let html = [];
                        html.push('<div>'+row.payMethod+'订单:');
                        html.push(row.wechatOrder);
                        html.push('</div><div>商户订单:');
                        html.push(row.orderNo);
                        html.push('</div>');
                        return html.join('');
                    }
                }, {
                    code: '',
                    title: '交易',
                    className: "hide_el",
                    width: '150px',
                    formatter: function (val, row) {
                        let html = [];
                        html.push('<div>类型:');
                        html.push(row.payType);
                        html.push('</div><div>状态:');
                        html.push(row.payStatus);
                        html.push('</div>');
                        return html.join('');
                    }
                }, {
                    code: 'productName',
                    title: '商品名称',
                    className: "hide_el",
                    formatter: function (val, row) {
                        return val + '，' + (row.nonceStr || '');
                    }
                }, {
                    code: 'totalAmount',
                    title: '金额',
                    width: '90px',
                    textAlign: 'right'
                }, {
                    code: 'promotionAmount',
                    title: '优惠',
                    width: '75px',
                    textAlign: 'right'
                }, {
                    code: 'charge',
                    title: '手续费',
                    width: '75px',
                    textAlign: 'right'
                }],
                multiple: false,
                rowIndex: true,
                checkbox: false,
                ajaxType: Dolphin.requestMethod.POST,
                url: '/api/905c5c466a3b4c08957487b7273f0018',
                data: {rows: []},
                pagination: true,
                onLoadSuccess: function (data) {
                    if (data.value) {
                        $('#totalSum').html(data.value.total);
                        $('#feeSum').html(data.value.charge);
                    }
                }
            });
        }
    };
});