/**
 * Created by wangshuyi on 2017/8/10.
 */

'use strict';

(function () {
    const PickModal = function(param) {
        this.init(param);
    };

    const defaultParam = {
        title: '',
        selectedList:{
            columns:[{
                code: "name",
                title : "名称",
            },{
                code: "code",
                title : "编码",
            }],
            url:'',
            idField:'_id',
            data: {total: 0, rows:[]},
            title:'已选中',
            height:'500px',
            pagination: false,
            rowIndex: false,
        },
        unSelectList:{
            columns:[{
                code: "name",
                title : "名称",
            },{
                code: "code",
                title : "编码",
            }],
            url:'',
            idField:'_id',
            data: {total: 0, rows:[]},
            title:'未选中',
            height:'500px',
            pagination: false,
            rowIndex: false,
        },
        dataFilter:{
            select: function (data) { return data; },
            unSelect: function (data) { return data; },
        },

        onShow: function () {},
        onHide: function () {},
        onSubmit: function (data) {

        },
    };

    PickModal.prototype = {
        constructor : PickModal,
        modal: null,
        selectedList: null,
        unSelectList: null,

        button: {
            select: null,
            selectAll: null,
            unSelect: null,
            unSelectAll: null,
        }
    };

    PickModal.prototype.init = function (param) {
        this.opts = Object.assign({}, defaultParam, param);
        this.opts.selectedList = Object.assign({}, defaultParam.selectedList, this.opts.selectedList);
        this.opts.unSelectList = Object.assign({}, defaultParam.unSelectList, this.opts.unSelectList);

        this.render();
        this.initEvent();
    };

    PickModal.prototype.render = function () {
        let _this = this;
        let content = $('<div>').addClass('row');

        let leftPanel = $('<div>').addClass('col-sm-5').appendTo(content);
        let buttonPanel = $('<div>').addClass('col-sm-2').appendTo(content);
        let rightPanel = $('<div>').addClass('col-sm-5').appendTo(content);

        //button
        this.button.selectAll = $('<button class="btn btn-info btn-block">').html('<<').appendTo(buttonPanel);
        this.button.select = $('<button class="btn btn-info btn-block">').html('<').appendTo(buttonPanel);
        this.button.unSelect = $('<button class="btn btn-success btn-block">').html('>').appendTo(buttonPanel);
        this.button.unSelectAll = $('<button class="btn btn-success btn-block">').html('>>').appendTo(buttonPanel);

        let selectPanel = $('<div>').appendTo(leftPanel);
        this.selectedList = new Dolphin.LIST(Object.assign({
            panel : selectPanel,
        }, this.opts.selectedList));

        let unSelectPanel = $('<div>').appendTo(rightPanel);
        this.unSelectList = new Dolphin.LIST(Object.assign({
            panel : unSelectPanel,
        }, this.opts.unSelectList));

        let footer = $('<div>');
        $('<button type="button" class="btn btn-primary btn-small">').html('保存').click(function(){
            _this.submit();
        }).appendTo(footer);
        $('<button type="button" class="btn btn-default btn-small">').html('取消').click(function(){
            _this.hide();
        }).appendTo(footer);

        this.modal = new Dolphin.modalWin({
            content : content,
            title : this.opts.title || "请选择",
            defaultHidden : true,
            width: '1200px',
            footer : footer,
            hidden : function () {
                if(_this.opts.onHide.call(_this) !== false){
                    _this.modal.modal('hide');
                }
            }
        });
    };

    PickModal.prototype.initEvent = function () {
        let _this = this;
        this.button.select.click(function () {
            let data = _this.unSelectList.getChecked();
            _this.unSelectList.removeRows(data);

            if(typeof _this.opts.dataFilter.select === 'function'){
                data = _this.opts.dataFilter.select.call(_this, data);
            }

            data.forEach(function (d) {
                _this.selectedList.addRowWithData(d);
            });
        });
        this.button.selectAll.click(function () {
            let data = _this.unSelectList.data.rows.concat();
            _this.unSelectList.removeRows(data);

            if(typeof _this.opts.dataFilter.select === 'function'){
                data = _this.opts.dataFilter.select.call(_this, data);
            }

            data.forEach(function (d) {
                _this.selectedList.addRowWithData(d);
            });
        });
        this.button.unSelect.click(function () {
            let data = _this.selectedList.getChecked();
            _this.selectedList.removeRows(data);

            if(typeof _this.opts.dataFilter.unSelect === 'function'){
                data = _this.opts.dataFilter.unSelect.call(_this, data);
            }

            data.forEach(function (d) {
                _this.unSelectList.addRowWithData(d);
            });
        });
        this.button.unSelectAll.click(function () {
            let data = _this.selectedList.data.rows.concat();
            _this.selectedList.removeRows(data);

            if(typeof _this.opts.dataFilter.unSelect === 'function'){
                data = _this.opts.dataFilter.unSelect.call(_this, data);
            }

            data.forEach(function (d) {
                _this.unSelectList.addRowWithData(d);
            });
        });
    };

    PickModal.prototype.show = function () {
        if(typeof this.opts.onShow === 'function'){
            if(this.opts.onShow.call(this) !== false){
                this.modal.modal('show');
            }
        }else{
            this.modal.modal('show');
        }
    };
    PickModal.prototype.hide = function () {
        this.modal.modal('hide');
    };
    PickModal.prototype.submit = function () {
        let data = this.selectedList.data.rows;
        if(typeof this.opts.onSubmit === 'function'){
            if(this.opts.onSubmit.call(this, data) !== false){
                this.modal.modal('hide');
            }
        }else{
            this.modal.modal('hide');
        }
    };

    window.PickModal = PickModal;
})();


