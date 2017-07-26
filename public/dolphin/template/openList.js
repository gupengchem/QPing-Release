/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved. 
 */

(function ($) {
    var thisTool = Dolphin;
    var openListTemplate = {};

    openListTemplate.item = function (data) {
        var productListItem = $('<div class="col-sm-4 col-md-3 productListItem">');

        var productBorder = $('<div class="productBorder">').appendTo(productListItem);

        var productImg = $('<div class="productImg">').appendTo(productBorder);
        $('<img>').addClass('img-responsive img-productItem').attr('src', systemConfig.basePath + systemConfig.port + '/pic/image/biz/' + data.id).appendTo(productImg);

        var productInfo1 = $('<div class="row productInfo">').appendTo(productBorder);
        var productInfo1_ = $('<div class="col-xs-12">').appendTo(productInfo1);
        $('<div class="productName">').attr('title', data.shortText).html(data.shortText).appendTo(productInfo1_);
        $('<div class="productCode">').html(data.skuId).appendTo(productInfo1_);

        var productInfo2 = $('<div class="row productInfo">').appendTo(productBorder);
        var productInfo2_ = $('<div class="col-xs-12">').appendTo(productInfo2);
        $('<span class="productPrice">').css('margin-right', '20px').html('单价：' + (data.value1 ? '￥' + data.value1 : '暂无')).appendTo(productInfo2_);
        $('<span class="productPrice">').html('保证金：' + (data.value2 ? '￥' + data.value2 : '暂无')).appendTo(productInfo2_);

        var productInfo3 = $('<div class="row productInfo">').appendTo(productBorder);
        var productInfo3_ = $('<div class="col-xs-12">').appendTo(productInfo3);
        $('<span class="productTransform">').html('箱托转换率：' + (data.divisor ? data.divisor + '箱/托' : '暂无')).appendTo(productInfo3_);

        var productInfo4 = $('<div class="row productInfo">').appendTo(productBorder);
        var productInfo4_ = $('<div class="col-xs-12">').appendTo(productInfo4);
        if (this.opts['promotionInfo']) {
            $('<div>').css({
                float: 'left',
                "margin-right": '0px',
                "font-size": '13px',
                'font-weight': 700,
                color: '#398439'
            }).html('[' + Dolphin.enum.getEnumText("productUnit", data.openUnit_) + ']总数：' + data.promotionTotal_ + ', 剩余数：' + data.promotionRemain_);
        } else {
            $('<div>').css({
                float: 'left',
                "margin-right": '20px',
            }).html(TOOL.longDate2string(data.startDate_) + '至' + TOOL.longDate2string(data.endDate_));
        }

        return productListItem;
    };

    thisTool.template.openListTemplate = openListTemplate;
})(jQuery);