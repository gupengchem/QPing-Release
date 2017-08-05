'use strict';
$(function () {
    org.breezee.page = {
        init: function () {
            this.initEvent();
            this.initDataList();
            console.log('load the shop.js....');
        },

        initEvent: function () {
            let me = this;

            $('.btn_query').click(function () {
                me._dataList.load(null, Dolphin.form.getValue('#query_form'));
            });

            org.breezee.syncListen("确认同步门店信息",{
                mo: 'com.pcp.api.pos.service.IShopService',
                rule: 'shop',
                endpoint: '002',
                UPDDT:'1900-01-01'
            });
        },

        initDataList: function () {
            let me = this;
            me._dataList = new Dolphin.LIST({
                panel: "#dataList",
                idField: 'id',
                hover: false,
                columns: [{
                    code: 'createTime',
                    title: '开业日期',
                    width: '130px'
                }, {
                    code: 'code',
                    title: '门店编码',
                    width: '150px'
                }, {
                    code: 'name',
                    title: '门店名称',
                    width: '150px'
                }, {
                    code: 'remark',
                    title: '地址',
                    formatter: function (val) {
                        return val;
                    }
                }, {
                    code: 'name',
                    title: '经纬度',
                    width: '150px',
                    formatter:function (val,row) {
                        return row.longitude+'，'+row.latitude;
                    }
                }, {
                    code: 'telephone',
                    title: '电话',
                    width: '110px',
                    className: "hide_el"
                }, {
                    code: 'statusName',
                    title: '状态',
                    width: '100px',
                    className: "hide_el"
                }, {
                    code:'',
                    title:'消费情况',
                    width:'150px',
                    formatter:function (val, row) {
                        let html = [];
                        html.push('<div>消费总数:');
                        html.push(row.orderCount || '-');
                        html.push('</div><div>消费总金额:');
                        html.push(row.orderAmount || '-');
                        html.push('</div>');
                        return html.join('');
                    }
                }, {
                    code: 'id',
                    title: '&nbsp;',
                    className: "hide_el",
                    width:'100px',
                    formatter: function (val, row, index) {
                        return org.breezee.buttons.edit({
                            id: row.id
                        });
                    }
                }],
                multiple: true,
                rowIndex: true,
                checkbox: true,
                ajaxType: Dolphin.requestMethod.POST,
                url: '/api/445a2ba90204414387ba30a336f016b6',
                pagination: true,
                onLoadSuccess: function () {

                }
            });
        }
    };

    pcp.page.init();
});