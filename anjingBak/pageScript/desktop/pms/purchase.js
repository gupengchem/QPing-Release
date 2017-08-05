'use strict';
$(function () {
    org.breezee.page = {
        init: function () {
            this.initEvent();
            this.initOrderGrid();
            Dolphin.form.parse("#query_form");
        },

        /**
         * 初始化事件
         */
        initEvent: function () {
            let me = this;
            $(".btn_query").click(function () {
                let d = Dolphin.form.getValue('#query_form');
                me._orderGrid.query({properties: $.extend({}, d, {})});
            });

        },

        initOrderGrid: function () {
            this._orderGrid = new GRID({
                panel:'#dataList',
                url: '/api/fbbc247ea033447b9db0883366fc7c05',
                ajaxType: Dolphin.requestMethod.POST,
                childrenField: 'purchaseLines',
                queryParams: {},
                titleFormatter: function (data, index) {
                    let title = '';
                    title += '<span class="titleOrderNo">' + (this.opts.pageElements + index + 1) + '.</span>';
                    title += '<span style="margin: 0 5px;background-color: #FF6600;font-weight: 700;color: #fff;">' + Dolphin.enum.getEnumText('purchaseType', data.type) + '</span>';
                    title += '<span>' + data.createTime + '</span>';
                    title += '<span>订单号：' + (data.code || '待生成') + '</span>';
                    title += '<span>供应商：' + data.procureCode + data.procureName + '</span>';
                    title += '<span>交货日期：' + data.deliveryDate.substr(0,10) + '</span>';
                    return title;
                },
                operationFormatter: function (data, index) {
                    return ""
                },
                columns: [{
                    code: 'image',
                    className: 'img',
                    width:'15%',
                    formatter: function (val, obj, data, index) {
                        return '<img class="img-responsive" style="width: 90px;" src="' + org.breezee.context.getImgSrc(val) + '" />';
                    }
                }, {
                    code: 'title',
                    className: 'info',
                    formatter: function (val, obj, data, index) {
                        let html = '';
                            html += '<div class="prt-remark unzhehang">' + obj.name + '</div>';
                        html += '<div class="prt-code">' + obj.material + '</div>';
                        return html;
                    }
                }, {
                    code: 'price',
                    className: 'price',
                    width: '180px',
                    formatter: function (val, obj, data, index) {
                        let html = '';
                        html += '<div>' + (val ? val : 0) + '</div>';
                        return html;
                    }
                },  {
                    code: 'quantity',
                    width: '120px',
                    formatter:function (val,obj) {
                        let html = '';
                        html += '<div>' + (val ? val : 0) + " "+obj.unit+'</div>';
                        return html;
                    }
                }, {
                    code: 'attr',
                    className: 'mergeCell',
                    merge: true,
                    width: '150px',
                    formatter: function (val, obj, data, objIndex, dataIndex) {
                        return "<div>总金额:" + (data.totalAmount ? data.totalAmount.toFixed(2) : 0) + "</div>";
                    }
                }, {
                    code: 'status',
                    className: 'mergeCell',
                    merge: true,
                    width: '150px',
                    formatter: function (val, obj, data, objIndex, dataIndex) {
                        return "<div style='padding: 5px;'><span class='text-info'>" + data.statusName + "</span></div>";
                    }
                }]
            });
        }

    };
});