'use strict';
$(function () {
    org.breezee.page = {
        init: function () {
            org.breezee.utils.loadJS(["/jquery-file-upload/js/vendor/jquery.ui.widget.js",
                    "/jquery-file-upload/js/vendor/jquery.ui.widget.js",
                    "/jquery-file-upload/js/jquery.fileupload.js"],
                "/page/scripts/desktop/asyncLoad.js?_token=" + new Date().getTime());
            org.breezee.utils.loadCSS("/jquery-file-upload/css/jquery.fileupload.css");

            this.initEvent();
            this.initDataList();
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
            });

            org.breezee.syncListen("确认同步SKU物料信息？",{
                mo: 'com.pcp.api.pms.service.IMaterielService',
                rule: 'materiel',
                endpoint: '032',
                LAEDA:'1900-01-01'
            });
        },

        initDataList: function () {
            let me = this;
            me._dataList = new Dolphin.LIST({
                panel: "#dataList",
                idField: 'id',
                title:'物料列表',
                hover: false,
                columns: [{
                    code: 'image',
                    title: '物料图片',
                    width: '90px',
                    formatter: function (val, row) {
                        return '<div style="width: 80px;"><img src="' + org.breezee.context.getImgSrc(val?val:'default.png') + '" class="img-fluid materiel-image" alt="' + row.name + '"></div>'
                    }
                }, {
                    code: 'name',
                    title: '物料名称'
                }, {
                    code: 'code',
                    title: '物料编码',
                    width: '150px'
                },{
                    code: 'unit',
                    title: '标准单位',
                    width: '100px',
                    className: "hide_el",
                    formatter:function (val) {
                        return Dolphin.enum.getEnumText('standardUnit',val);
                    }
                }, {
                    code: 'checkInfo',
                    title: '盘点类型',
                    width: '160px',
                    className: "hide_el"
                },{
                    code: 'code',
                    title: '储存条件',
                    width: '150px',
                    className: "hide_el",
                    formatter: function (val, row) {
                        return Dolphin.enum.getEnumText('temperature',row.temperature)+"&nbsp;&nbsp;"+row.shelfLife
                            +Dolphin.enum.getEnumText('shelfUnit',row.shelfUnit);
                    }
                }, {
                    code: 'id',
                    title: '&nbsp;',
                    width: '90px',
                    className: "hide_el",
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
                url: '/api/53afe452392f44b19d64ae88d1de7491',
                pagination: true,
                onLoadSuccess: function () {
                    org.breezee.buttons.editCallback('/api/8fa200b02def4bdf88f4edaaec3b259e','id',function () {
                        $('#dataModal').modal('show');
                    });
                }
            });
        }
    };
});
