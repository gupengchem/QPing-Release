'use strict';
$(function () {
    org.breezee.page = {
        init: function () {

            this.initEvent();
            this.initDataList();
            console.log('load the List.js....');
        },

        initEvent: function () {
            let me = this;

            $('.btn_query').click(function () {
                me._dataList.load(null, Dolphin.form.getValue('#query_form'));
            });

            org.breezee.syncListen("确认同步成品物料信息？", {
                mo: 'com.pcp.api.pms.service.IProductService',
                rule: 'product',
                endpoint: '005',
                DATE: '1900-01-01'
            });
        },

        initDataList: function () {
            let me = this;
            me._dataList = new Dolphin.LIST({
                panel: "#dataList",
                idField: 'id',
                title: '菜品列表',
                hover: false,
                columns: [{
                    code: 'name',
                    title: '菜品名称',
                }, {
                    code: 'code',
                    title: '菜品编码',
                    width: '150px'
                }, {
                    code: 'dn',
                    title: '销售编码',
                    width: '150px',
                    className: "hide_el",
                    formatter: function (val) {
                        return Dolphin.enum.getEnumText('standardUnit', val);
                    }
                }, {
                    code: 'price',
                    title: '销售价格',
                    width: '160px',
                    className: "hide_el"
                }, {
                    code: 'saleQuantity',
                    title: '已销售数量',
                    width: '150px'
                }],
                multiple: true,
                rowIndex: true,
                checkbox: true,
                ajaxType: Dolphin.requestMethod.POST,
                url: '/api/ac2667589602456194b6a26ce3c77e3e',
                pagination: true
            });
        }
    };
});

