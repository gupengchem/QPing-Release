/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved.
 */

(function ($) {
    var thisTool = Dolphin;
    var productGridTemplate = {};

    productGridTemplate.defaults = {
        productUnitOption: [{"code": "KAR", name: "箱"}],
        mdCol: 3
    };
    productGridTemplate.init = function (params) {
        this.opts = $.extend(this.opts, productGridTemplate.defaults, params);
        //初始化单位
        this.defaultUnit = this.opts.productUnitOption[0];
        for (var i = 1; i < this.opts.productUnitOption.length; i++) {
            if (this.opts.productUnitOption[i].default) {
                this.defaultUnit = this.opts.productUnitOption[i];
            }
        }
    };
    productGridTemplate.item = function (data) {
        var productListItem = $('<div class="col-sm-4 col-md-' + this.opts.mdCol + ' productListItem" id="line-' + data[this.opts.idField] + '">')
            , productBorder = $('<div class="productBorder">').appendTo(productListItem),
            productImg = $('<div class="itemImg">').appendTo(productBorder)
            , priceDef = (data.priceInfoList && data.priceInfoList[0]) || {};
        Dolphin.createImg({
            id: data.product.code
        }).appendTo(productImg);

        var productInfo1 = $('<div class="row itemInfo">').appendTo(productBorder);
        var productInfo1_ = $('<div class="col-xs-12">').appendTo(productInfo1);
        $('<div class="name">').attr('title', data.product.shortText || data.shortText).html(data.product.shortText || data.shortText).appendTo(productInfo1_);
        $('<div class="code">').html('<span>' + (data.product.code || data.code) + '</span>').appendTo(productInfo1_);


        var productInfo3 = $('<div class="row itemInfo">').appendTo(productBorder);
        var productInfo3_ = $('<div class="col-xs-12">').appendTo(productInfo3);
        $('<span class="productTransform">').html((data.product.divisor ? data.product.divisor + '箱/托' : '-')).appendTo(productInfo3_);

        var productCheck = $('<div class="row itemCheck">').appendTo(productBorder);
        var productCheckbox = $('<div class="col-xs-5" style="padding-right: 0;">').appendTo(productCheck);
        var productCheckboxLabel = $('<label class="checkbox-inline">').appendTo(productCheckbox);
        var checkbox = $('<input type="checkbox" class="itemChecked">').val(data[this.opts.idField]).appendTo(productCheckboxLabel);
        $('<span class="buyButton">').html('计划').appendTo(productCheckboxLabel);
        if (this.opts.checkedObj[data[this.opts.idField]] && this.opts.checkedObj[data[this.opts.idField]].checked) {
            checkbox.attr('checked', true);
            if (this.trashFlag) {
                var lineDelBtn = $('<a class="btn btn-sm lineDel" style="float: right;color: #c0392b;margin-top: -2px;padding: 9px 10px 9px 0;" href="javascript:void(0);"><i class="fa fa-trash fa-lg"></i></a>')
                    .attr('item-id', data[this.opts.idField])
                    .appendTo(productCheckbox);
                lineDelBtn.bind('click', function () {
                    /*$("#line-" + $(this).attr('item-id')).remove();*/
                    if (org.breezee.page.planLineDelete) {
                        org.breezee.page.planLineDelete(data.properties.planLineId);
                    }
                });
            }
            if (this.checkDisabled && this.opts.checkedObj[data[this.opts.idField]].properties.checkDisabled)
                checkbox.attr('disabled', true);
        }
        var productNumber = $('<div class="col-xs-7" style="padding-left: 0;">').appendTo(productCheck);
        var inputGroup = $('<div class="input-group input-group-sm" style="margin-top: 2px;">').appendTo(productNumber);
        var inputNumber = $('<input type="text" placeholder="' + this.opts.emptyText + '" class="form-control productItemNumber">').attr({
            itemId: data[this.opts.idField],
            "aria-describedby": "basic-addon2"
        }).appendTo(inputGroup);
        if (this.opts.checkedObj[data[this.opts.idField]]) {
            inputNumber.val(this.opts.checkedObj[data[this.opts.idField]].quantity);
            if (this.checkDisabled && this.opts.checkedObj[data[this.opts.idField]].properties.checkDisabled)
                inputNumber.attr('disabled', true);
        } else {
            inputNumber.attr({
                readonly: "readonly"
            });
        }
        var unitButton = $('<div class="input-group-btn" id="basic-addon2">').appendTo(inputGroup);
        var button = $('<button type="button" class="btn btn-default dropdown-toggle productItemUnit">').attr({
            "data-toggle": "dropdown",
            "aria-haspopup": true,
            "aria-expanded": false
        }).appendTo(unitButton);
        if (this.opts.checkedObj[data[this.opts.idField]]) {
            button.html(this.opts.checkedObj[data[this.opts.idField]].unitName);
        } else {
            button.html(data.product.unitName);
        }
        //bind function
        var thisPriductGrid = this;
        checkbox.bind('change', function () {
            if (this.checked) {
                $(this).closest('.productListItem').find('.productItemNumber').removeAttr('readonly').focus();
            } else {
                $(this).closest('.productListItem').find('.productItemNumber').attr('readonly', 'readonly').val("");
            }
            thisPriductGrid.checkItem(this, data);
        });
        inputNumber.bind('blur', function () {
            var thisInput = $(this);
            var value = thisInput.val();
            if (value != '' && value != parseInt(value)) {
                thisInput.popover({
                    placement: 'top',
                    content: '请输入整数。'
                }).popover('show');
                this.focus();
            } else {
                thisInput.popover('destroy');
            }
            thisPriductGrid.changeNum(this, data);
        });
        if (this.opts.productUnitOption.length > 1) {
            unitOption.find('.productGridItemUnit').bind('click', function () {
                var thisInput = $(this).closest(".input-group-btn").prev();
                $(this).closest(".dropdown-menu").prev().html($(this).html() + ' <span class="caret"></span>');
                thisInput.attr("itemUnit", $(this).attr("unit"));
                thisPriductGrid.changeNum(thisInput);
            });
        }
        return productListItem;
    };

    Dolphin.template.productGridTemplate = productGridTemplate;
})(jQuery);