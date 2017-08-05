'use strict';
$(function () {
    org.breezee.page = {
        init: function () {
            this.initEvent();
            this._materielListSelect = this.materielSelectList('materielListSelect');
            this._materielList = this.materielList('materielList');
            this.priceList();
            this.shopList();
            this.curShop = null;
        },

        /**
         * 初始化事件
         */
        initEvent: function () {
            let me = this;
            $('.newOrder').click(function () {
                $("#dataModal").modal('show');
            });

            $(".btn-materiel-select").click(function () {
                if (me.curShop) {
                    me._materielListSelect.load(null, {not_shop: me.curShop});
                    $("#dataModal").modal('show');
                } else {
                    Dolphin.alert('请选择一个门店');
                }
            });

            $(".btn_confirm").click(function () {
                let checkedshop = me._shopList.getChecked()[0];
                let checkedMateriel = me._materielListSelect.getChecked();
                let dd = [];
                $.each(checkedMateriel, function () {
                    if(this.code) {
                        dd.push({
                            shopCode: checkedshop.code,
                            materialCode: this.code,
                            code: checkedshop.code + "_" + this.code,
                            name: checkedshop.name
                        });
                    }
                });
                Dolphin.ajax({
                    url: '/api/bcb678e90348432280cf2ec81f2a1097',
                    type: Dolphin.requestMethod.POST,
                    data: Dolphin.json2string({
                        code: checkedshop.code,
                        shopMaterielInfos: dd
                    }),
                    success: function (reData, textStatus) {
                        if (reData.success) {
                            $("#dataModal").modal('hide');
                            me._materielList.load(null, {in_shop: me.curShop});
                        } else {
                            $("#error_message").html(reData.msg);
                        }
                    },
                    onError: function () {
                        $("#error_message").html('系统出错，请联系管理员');
                    }
                });
            });


            $(".btn_saved").click(function () {
                let checkedMateriel = me.curShopMatel;
                let checkedPrice = me._priceList.data.rows;
                let dd = [];
                console.log(checkedMateriel,'--------');
                $.each(checkedPrice, function () {
                    if(this.supplierCode) {
                        dd.push({
                            code: checkedMateriel + "_" + this.supplierCode,
                            shopMatCode: checkedMateriel,
                            supplierCode: this.supplierCode,
                            unit: this.unit,
                            price: this.price,
                            name: "NoName"
                        });
                    }
                });
                console.log("length", checkedPrice);
                Dolphin.ajax({
                    url: '/api/95d7cd8d08884789841d354411849ba7',
                    type: Dolphin.requestMethod.POST,
                    data: Dolphin.json2string({
                        code: checkedMateriel.code,
                        priceInfoList: dd
                    }),
                    success: function (reData, textStatus) {
                        if (reData.success) {
                            alert("成功");
                        } else {
                            $("#error_message").html(reData.msg);
                        }
                    },
                    onError: function () {
                        $("#error_message").html('系统出错，请联系管理员');
                    }
                });
            });


        },

        shopList: function () {
            let me = this;
            me._shopList = new Dolphin.LIST({
                panel: "#shopList",
                idField: 'id',
                hover: false,
                columns: [{
                    code: 'name',
                    title: '门店名称',
                }],
                multiple: false,
                rowIndex: false,
                checkbox: true,
                ajaxType: Dolphin.requestMethod.POST,
                queryParams: {
                    pageSize: 10000
                },
                url: '/api/3416f9ded3b64ca19ed78a80d54c7653',
                pagination: false,
                onClick: function (data) {
                    $("#selectMat").show();
                    me.curShop = data.code;
                    $(".btn-materiel-select").removeAttr('disabled');
                    me._materielList.load(null, {in_shop: me.curShop});
                },
                onUnchecked: function () {

                }
            });
        },

        materielList: function (panel) {
            let me = this;
            return new Dolphin.LIST({
                panel: "#" + panel,
                idField: 'id',
                hover: false,
                columns: [{
                    code: 'code',
                    title: '物料编码',
                }, {
                    code: 'name',
                    title: '物料名称',
                }],
                multiple: false,
                rowIndex: false,
                checkbox: true,
                ajaxType: Dolphin.requestMethod.POST,
                queryParams: {
                    pageSize: 10000
                },
                url: '/api/53afe452392f44b19d64ae88d1de7491',
                pagination: false,
                data: {rows: [{}]},
                onClick: function (data) {
                    $("#selectPrice").show();
                    me.curShopMatel = data.code;
                    me._priceList.load(null, {shopMatCode: me.curShopMatel});
                },
                onUnchecked: function () {

                }
            });
        },

        materielSelectList: function (panel) {
            let me = this;
            return new Dolphin.LIST({
                panel: "#" + panel,
                idField: 'id',
                hover: false,
                columns: [{
                    code: 'code',
                    title: '物料编码',
                }, {
                    code: 'name',
                    title: '物料名称',
                }],
                multiple: true,
                rowIndex: false,
                checkbox: true,
                ajaxType: Dolphin.requestMethod.POST,
                queryParams: {
                    pageSize: 10000
                },
                url: '/api/53afe452392f44b19d64ae88d1de7491',
                pagination: false
            });
        },

        priceList: function () {
            let me = this;
            me._priceList = new Dolphin.LIST({
                panel: "#priceList",
                idField: 'id',
                hover: false,
                columns: [{
                    code: 'supplierCode',
                    title: '供应商名称',
                }, {
                    code: 'price',
                    title: '采购价格',
                    width: '90px'
                }, {
                    code: 'unit',
                    title: '采购单位',
                    width: '90px'
                }],
                multiple: false,
                rowIndex: false,
                checkbox: false,
                editFlag: true,
                data: {rows: []},
                pagination: false,
                ajaxType: 'post',
                url: '/api/b50b47417fd346d2b254dd93e4f4fef8',
                onClick: function () {

                },
                onUnchecked: function () {

                }
            });
        },
    };
});