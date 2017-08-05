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
            this.initDetailsList();
            console.log('load the materielList.js....');

            Dolphin.form.parse("#data_form");
        },

        initEvent: function () {
            let me = this;
            //新增窗口弹出
            $('.btn_add').click(function () {
                console.log('add button click....');
                $('#dataModal').modal('show');
            });

            $('.btn_query').click(function () {
                me._dataList.load("/api/6b4c345c3988f533f6188cab1837c1a7", {properties:Dolphin.form.getValue('#query_form')});
            });

            $('.btn_save').click(function () {
                let data = Dolphin.form.getValue('#data_form');
                console.log(data);
                Dolphin.ajax({
                    url: '/fetch/save',
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

            $('#dataModal').on('hidden.bs.modal', function () {
                Dolphin.form.empty('#data_form');
                $("#error_message").empty();
            })
        },

        initDataList: function () {
            let me = this;
            me._dataList = new Dolphin.LIST({
                panel: "#dataList",
                title:'采购列表',
                idField: 'id',
                hover: false,
                columns: [{
                    code: 'code',
                    title: '单据号',
                    width: '150px'
                }, {
                    code: 'status',
                    title: '业务类型',
                    width: '150px',
                    formatter: function (val, row, index) {
                        if(row.status==1){
                            return "领用";
                        } else if(row.status==2){
                            return "报损";
                        }
                    }
                }, {
                    code: 'createTime',
                    title: '过账日期',
                    width: '150px'
                }, {
                    code: 'creator',
                    title: '创建人',
                    width: '150px'
                }, {
                    code: 'dept_id',
                    title: '部门编号',
                    width: '100px'
                }, {
                    code: 'dept_name',
                    title: '部门名称',
                    width: '100px'
                }, {
                    code: 'id',
                    title: '&nbsp;',
                    width: '120px',
                    className: "hide_el",
                    formatter: function (val, row) {
                        return org.breezee.buttons.view({
                            id: row.id
                        });
                    }
                }],
                multiple: true,
                rowIndex: true,
                checkbox: true,
                ajaxType: Dolphin.requestMethod.POST,
                url: '/api/6b4c345c3988f533f6188cab1837c1a7',
                pagination: true,
                onLoadSuccess: function () {
                    org.breezee.buttons.viewCallback('/api/e452d64ae88d1392de749153aff44b19','id',function () {
                        $('#dataModal').modal('show');
                    });
                }
            });
        },initDetailsList: function () {
            let me = this;
            me._dataList = new Dolphin.LIST({
                panel: "#detailsList",
                editListName:'lineInfoList',
                idField: 'id',
                hover: false,
                editFlag:true,
                data:{rows:[{},{}]},
                columns: [{
                    code: 'name',
                    title: '物料名称',
                    width: '80px',
                    formatter:function (val,row) {
                        return '<select class="form-control select2-single" ><option value="西红柿">西红柿</option><option value="鸡蛋">鸡蛋</option></select>'
                    }
                }, {
                    code: 'unit',
                    title: '单位',
                    width: '70px',
                    formatter:function (val,row) {
                        return '<select class="form-control" ><option value="kg">kg</option><option value="g">g</option><option value="bag">bag</option></select>'
                    }
                }, {
                    code: 'quantity',
                    title: '数量',
                    width: '100px'
                }, {
                    code: 'remark',
                    title: '原因',
                    width: '100px',
                    formatter:function (val,row) {
                        return '<select class="form-control" ><option value="不知道1">不知道1</option><option value="不知道2">不知道2</option><option value="不知道3">不知道3</option></select>'
                    }
                }/*, {
                 code: 'quantity',
                 title: '批次',
                 width: '100px'
                 }*/],
                multiple: true,
                rowIndex: false,
                checkbox: false,
                ajaxType: Dolphin.requestMethod.POST,
                url: '',
                pagination: false,
            });
        }
    };
});
