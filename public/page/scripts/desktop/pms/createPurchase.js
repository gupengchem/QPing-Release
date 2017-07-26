/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved.
 */

"use strict";
$(function () {
    org.breezee.page = {
        init: function () {
            org.breezee.utils.loadJS(["/assets/js/bootstrap-datepicker.min.js"],
                "/page/scripts/desktop/asyncLoad.js?_token=" + new Date().getTime());
            // this._dataList = this.dataList('#dataList');
            this.initEvent();
            this.productList(0);
            this.cartShow();
            this.productCart = {};
            this.cartNum = 0;
            this.orderData = {
                name: '上海新天地店',
                storeCode: '10011001'
            };
            Dolphin.form.parseSelect($('#supplyer'));
            Dolphin.form.parse("#order-form");
        },

        initEvent: function () {
            console.info(";;.........");

            $('.btn_query').click();
            $('#dataModal').modal('hide');
            let me = this;
            $('.btn-query').click(function () {
                let d = Dolphin.form.getValue('.query-form');
                me._dataList.reload(null, d);
            });

            $('body').on('click', '.prdChecked', function () {
                let ci = $(this).closest('ul').find('.checkInput');
                ci.val('');
                if (this.checked) {
                    ci.removeAttr('disabled');
                    ci.focus();
                } else {
                    ci.attr('disabled', 'true');
                    if (me.productCart[$(this).data('id')]) {
                        me.cartNum--;
                        $("#cartNumBadge").html(me.cartNum);
                    }
                    delete me.productCart[$(this).data('id')];
                }
            });


            $('body').on('change', '.checkInput', function () {
                if ($(this).val() > 0) {
                    let prdInfoData = $(this).closest('.prdInfo'), id = $(this).data('id');
                    if (!me.productCart[id])
                        me.cartNum++;
                    else
                        delete  me.productCart[id];
                    me.productCart[id] = {
                        name: prdInfoData.find('.prdName').html(),
                        code: prdInfoData.find('.prdCode').html(),
                        price: prdInfoData.find('.prdPrice').html(),
                        unit: prdInfoData.find('.prdUnit').html(),
                        quantity: $(this).val()
                    };
                    $("#cartNumBadge").html(me.cartNum);
                }
            });

            $(".nextStep").click(function () {
                if (me.cartNum < 1) {
                    alert('请选择物料数据');
                    return false;
                }
                let d = $(this).data('next');
                $('#' + d + 'A').tab('show');
                me.footBtn(d);
            });

            $('#profile4A').on('show.bs.tab', function (e) {
                if (me.cartNum < 1) {
                    alert('请选择物料数据');
                    return false;
                }
                me.footBtn('profile4');
                let prd = [], total = 0;
                for (let k in me.productCart) {
                    prd.push(me.productCart[k]);
                    total += (me.productCart[k].price * me.productCart[k].quantity);
                }
                me._selectList.loadData({rows: prd});

                Dolphin.form.setValue($.extend(me.orderData, {
                    totalAmount: total
                }), "#order-form");
                me.orderData.purchaseLines = prd;
            });
            $('#home4A').on('show.bs.tab', function (e) {
                me.footBtn('home4');
            });

            $('.btn-save').click(function () {
                console.log(me.orderData);
                let fd = Dolphin.form.getValue("#order-form");
                if (fd['deliveryDate'])
                    me.orderData.deliveryDate = fd['deliveryDate'] + ' 00:00:00';
                me.orderData.type = fd['type'];
                me.orderData.storeCode = $("#supplyer").val();
                Dolphin.ajax({
                    url: '/api/7a85498f65ab4a18a35604bbdb1dd649',
                    type: Dolphin.requestMethod.PUT,
                    data: Dolphin.json2string(me.orderData),
                    success: function (reData, textStatus) {
                        if (reData.success) {
                            alert('aaaa');
                        }
                    },
                    onError: function () {
                        $("#error_message").html('系统出错，请联系管理员');
                    }
                })
            });

        },

        productList: function (pageNumber) {
            this.loadMateriel(pageNumber);
        },
        loadMateriel: function (pageNumber) {
            Dolphin.ajax({
                url: '/api/53afe452392f44b19d64ae88d1de7491',
                type: Dolphin.requestMethod.POST,
                success: function (data, textStatus) {
                    if (data.success) {
                        console.log(data.total);
                        console.log(data.total / 10);
                        console.info(data.rows);
                        $.each(data.rows, function (i, value) {
                            $("#productList").append("<div class='col-md-4'>" +
                                "<div class='media'>" +
                                "<img class='d-flex mr-3' src='" + org.breezee.context.getImgSrc(value.image ? value.image : 'default.png') + "' alt='" + value.name + "'>" +
                                "<div class='media-body prdInfo'>" +
                                "<h5 class='mt-0 prdName'>" + value.name + "</h5>" +
                                "<div class='prdCode'>" + value.code + "</div>" +
                                "<div>" +
                                "<span class='prdPrice'>" + "700.00" + "</span>&nbsp;&nbsp;&nbsp;还余:<span>" + value.measureUnit + "&nbsp;" + Dolphin.enum.getEnumText('standardUnit', value.unit) + "</span>" +
                                "</div>" +
                                "<ul class='list-inline' style='margin-top: 10px;display: flex;'>" +
                                "<li>" +
                                "<input type='checkbox' class='prdChecked' data-id='ffff'/>" +
                                "</li>" +
                                "<li>" +
                                "<div class='input-group' style='width: 65%;'>" +
                                "<input class='form-control checkInput' data-id='ffff'" +
                                " placeholder=''" +
                                " disabled=''" +
                                " type='number'/>" +
                                "<span class='input-group-addon prdUnit'>" + Dolphin.enum.getEnumText('standardUnit', value.unit) + "</span>" +
                                "</div>" +
                                "</li>" +
                                "</ul>" +
                                "</div>" +
                                "</div>" +
                                "</div>");
                        });
                    } else {
                        $("#error_message").html(reData.msg);
                    }
                },
                onError: function () {
                    $("#error_message").html('系统出错，请联系管理员');
                }
            });
        },

        cartShow: function () {
            let me = this;
            me._selectList = new Dolphin.LIST({
                panel: "#selectList",
                idField: 'id',
                hover: false,
                columns: [{
                    code: 'name',
                    title: '物料名称'

                }, {
                    code: 'quantity',
                    title: '数量',
                    width: '80px'
                }, {
                    code: 'price',
                    title: '价格',
                    width: '80px'
                }],
                multiple: true,
                rowIndex: true,
                checkbox: false,
                data: {rows: []},
                pagination: false
            });
        },

        btnChange: function () {
            if (this._dataList.getChecked().length > 0) {
                $('.removeOrder').removeClass('disabled');
                $('.processOrder').removeClass('disabled');
                $('.uploadOrder').removeClass('disabled');
            } else {
                $('.removeOrder').addClass('disabled');
                $('.processOrder').addClass('disabled');
                $('.uploadOrder').addClass('disabled');
            }
        },

        footBtn: function (d) {
            if (d === 'profile4') {
                $(".nextStep3").show();
                $(".nextStep1").show();
                $(".nextStep2").hide();
            } else {
                $(".nextStep3").hide();
                $(".nextStep1").hide();
                $(".nextStep2").show();
            }
        }
    };
});