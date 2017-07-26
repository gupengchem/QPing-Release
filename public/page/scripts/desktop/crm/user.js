'use strict';
$(function () {
    org.breezee.page = {
        init: function () {
            org.breezee.utils.loadJS(["/libs/bootstrapFramework/vendor/jquery.maskedinput.min.js",
                    "/libs/bootstrapFramework/vendor/moment.min.js",
                    "/libs/bootstrapFramework/vendor/select2.min.js",
                    "/libs/bootstrapFramework/vendor/daterangepicker.js"],
                "/page/scripts/desktop/asyncLoad.js?_token=" + new Date().getTime());
            this.initEvent();
            this.initDataList();
            console.log('load the customer.js....');
        },

        initEvent: function () {
            let me = this;
            //新增窗口弹出
            $('.btn_add').click(function () {
                console.log('add button click....');
                $('#dataModal').modal('show');
            });

            $('.btn_query').click(function () {
                let d = Dolphin.form.getValue('#query_form');
                console.log(d);
                me._dataList.load(null, {properties:Dolphin.form.getValue('#query_form')});
            });

            $('.btn_save').click(function () {
                let data = Dolphin.form.getValue('#data_form');
                Dolphin.ajax({
                    url: '/user/save',
                    type: Dolphin.requestMethod.POST,
                    data: Dolphin.json2string(data),
                    success: function (reData, textStatus) {
                        if (reData.success) {
                            $('.btn_query').click();
                            $('#dataModal').modal('hide');
                        } else {
                            $("#error_message").html(reData.msg);
                        }
                        alert("save success!");
                    },
                    onError: function () {
                        $("#error_message").html('系统出错，请联系管理员');
                    }
                })
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
                    code: 'createTime',
                    title: '注册时间',
                    width: '100px'
                }, {
                    code: 'code',
                    title: '会员编码',
                    width: '90px'
                }, {
                    code: 'name',
                    title: '会员名称',
                    width: '80px'
                }, {
                    code: 'firstShop',
                    title: '首次门店',
                    width: '100px',
                    formatter: function (val) {
                        return val || '未知门店';
                    }
                }, {
                    code: 'mobile',
                    title: '联系手机',
                    width: '120px',
                    className: "hide_el"
                }, {
                    code: 'id',
                    title: '消费信息',
                    className: "hide_el",
                    width: '130px',
                    formatter: function (val, row) {
                        let html = [];
                        html.push('<div>当前等级:');
                        html.push(row.levelName || '-');
                        html.push('</div><div>消费总数:');
                        html.push((row.orderCount || '-') + ' / ￥' + (row.orderAmount || '-'));
                        html.push('</div>');
                        return html.join('');
                    }
                }, {
                    code: 'id',
                    title: '促销优惠',
                    width: '130px',
                    className: "hide_el",
                    formatter: function (val, row) {
                        let html = [];
                        html.push('<div>积分余额:');
                        html.push(row.pointAmount || '-');
                        html.push('</div><div>有效礼券:');
                        html.push(row.giftCount || '-');
                        html.push('</div>');
                        return html.join('');
                    }
                }, {
                    code: 'statusName',
                    title: '状态',
                    width: '70px',
                    className: "hide_el"
                }, {
                    code: 'id',
                    title: '&nbsp;',
                    width: '150px',
                    className: "hide_el",
                    formatter: function (val, row, index) {
                        return org.breezee.buttons.edit({
                                id: row.id
                            }) + '<a data-id="' + row.id + '" class="btn btn-outline btn-circle btn-sm dark detail_btn" ' +
                            'href="javascript:;">' +
                            '<i class="fa fa-info"></i> 详情</a>';
                    }
                }],
                multiple: true,
                rowIndex: true,
                checkbox: true,
                ajaxType: Dolphin.requestMethod.POST,
                url: '/api/41d7222ba7f246ceb33daaa4e5c97a0e',
                pagination: true,
                onLoadSuccess: function () {
                    org.breezee.buttons.editCallback('ac843b67de424221a24e9962e7281b33','id', function (data) {
                        $('#dataModal').modal('show');
                    });

                    $(".detail_btn").click(function () {
                        let id = $(this).data("id");
                        $("#userDetailContent").load('/detail/user/' + id);
                        $('#userModal').modal('show');
                    });
                }
            });
        }
    };
});