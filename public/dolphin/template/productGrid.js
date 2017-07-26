/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved. 
 */

(function ($) {
    var thisTool = Dolphin;
    var productGridTemplate = {};

    productGridTemplate.defaults = {
        productUnitOption: [{"code": "KAR", name: "箱"}, {"code": "BOT", name: "瓶"}, {"code": "BOX", name: "盒"}],
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
            id: data.code
        }).appendTo(productImg);

        var productInfo1 = $('<div class="row itemInfo">').appendTo(productBorder);
        var productInfo1_ = $('<div class="col-xs-12">').appendTo(productInfo1);
        $('<div class="name">').attr('title', data.shortText).html(data.shortText).appendTo(productInfo1_);
        $('<div class="code">').html('<span>' + data.code + '</span>').appendTo(productInfo1_);

        var productInfo2 = $('<div class="row itemInfo">').appendTo(productBorder);
        var productInfo2_ = $('<div class="col-xs-12">').appendTo(productInfo2);
        $('<span class="productPrice">').css('margin-right', '20px').html('单价:' + (priceDef.baseValue ? priceDef.baseValue : '-')).appendTo(productInfo2_);
        $('<span class="productPrice">').html('保证金:' + (priceDef.addInValue ? priceDef.addInValue : '-')).appendTo(productInfo2_);

        var productInfo3 = $('<div class="row itemInfo">').appendTo(productBorder);
        var productInfo3_ = $('<div class="col-xs-12">').appendTo(productInfo3);
        if (data.properties.openId)
            $('<span class="stockNumber">').css('margin-right', '20px').html(data.properties.remained ? Math.floor(data.properties.remained * 1000) / 1000 + data.unitName : '<s style="color: #8b0000;font-style: italic;">缺货</s>').appendTo(productInfo3_);
        else
            $('<span class="stockNumber">').css('margin-right', '20px').html('<small style="color: #00bf00;font-style: italic;">按单生产</small>').appendTo(productInfo3_);
        $('<span class="productTransform">').html((data.divisor ? data.divisor + '箱/托' : '-')).appendTo(productInfo3_);
        var productCheck = $('<div class="row itemCheck">').appendTo(productBorder);
        var productCheckbox = $('<div class="col-xs-5" style="padding-right: 0;">').appendTo(productCheck);
        var productCheckboxLabel = $('<label class="checkbox-inline">').appendTo(productCheckbox);
        var checkbox = $('<input type="checkbox" class="itemChecked">').val(data[this.opts.idField]).appendTo(productCheckboxLabel);
        $('<span class="buyButton">').html('购买').appendTo(productCheckboxLabel);
        if (this.opts.checkedObj[data[this.opts.idField]] && this.opts.checkedObj[data[this.opts.idField]].checked) {
            checkbox.attr('checked', true);
            if (this.checkDisabled && this.opts.checkedObj[data[this.opts.idField]].checkDisabled)
                checkbox.attr('disabled', true);
        }
        var productNumber = $('<div class="col-xs-7" style="padding-left: 0;">').appendTo(productCheck);
        var inputGroup = $('<div class="input-group input-group-sm" style="margin-top: 2px;font-size: 13px;">').appendTo(productNumber);
        var inputNumber = $('<input style="width: ' + (this.opts.productUnitOption.length > 1 ? 60 : 100) + '%;" type="text" placeholder="' + this.opts.emptyText + '" class="form-control productItemNumber">').attr({
            itemId: data[this.opts.idField],
            "aria-describedby": "basic-addon2"
        }).appendTo(inputGroup);
        if (this.opts.checkedObj[data[this.opts.idField]]) {
            inputNumber.val(this.opts.checkedObj[data[this.opts.idField]].quantity || this.opts.checkedObj[data[this.opts.idField]].properties.quantity);
            if (this.checkDisabled && this.opts.checkedObj[data[this.opts.idField]].checkDisabled)
                inputNumber.attr('disabled', true);
        } else {
            inputNumber.attr({
                readonly: "readonly"
            });
        }
        var unitButton, unitOption;
        if (this.opts.productUnitOption.length > 1) {
            unitButton = $('<div style="float: right;">').appendTo(inputGroup);
            unitOption = $('<select style="height: 30px;width: 34px;font-size: 11px;">').appendTo(unitButton);
            for (var i = 0; i < this.opts.productUnitOption.length; i++) {
                if (this.opts.productUnitOption[i].code == 'KAR' || this.opts.productUnitOption[i].code == data.measureUnit)
                    $('<option value="' + this.opts.productUnitOption[i].code + '">').html(this.opts.productUnitOption[i].name).appendTo(unitOption);
            }
        } else {
            unitButton = $('<div class="input-group-btn" id="basic-addon2">').appendTo(inputGroup);
            var button = $('<button type="button" class="btn btn-default dropdown-toggle productItemUnit">').attr({
                "data-toggle": "dropdown",
                "aria-haspopup": true,
                "aria-expanded": false
            }).appendTo(unitButton);
            if (this.opts.checkedObj[data[this.opts.idField]]) {
                button.html(this.opts.checkedObj[data[this.opts.idField]].unitName);
            } else {
                button.html(this.defaultUnit.name);
            }
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
            unitOption.bind('change', function () {
                var thisInput = $(this).closest(".input-group").children()[0];
                $(thisInput).attr("itemunit", $(this).val());
                $(thisInput).attr("itemunitName", $(this).find("option:selected").text());
                thisPriductGrid.changeNum($(thisInput), {unitChange: true});
            });
        }
        return productListItem;
    };

    Dolphin.template.productGridTemplate = productGridTemplate;
})(jQuery);