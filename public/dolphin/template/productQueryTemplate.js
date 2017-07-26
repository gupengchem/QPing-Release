/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved. 
 */

(function ($) {
    var thisTool = Dolphin;
    var productGridTemplate = {};

    productGridTemplate.defaults = {};
    productGridTemplate.init = function () {
    };
    productGridTemplate.item = function (data) {
        var col, item, img, info,
            name, category, desc, brand;

        col = $('<div class="dolphin-col-6">');

        item = $('<div class="item">').appendTo(col);

        img = $('<div class="itemImg">').appendTo(item);
        img.append(thisTool.createImg({id: data.imgId}));

        info = $('<div class="itemInfo">').appendTo(item);
        name = $('<div class="name">').html(data.shortText).appendTo(info);
        category = $('<span class="category">').html(data.catName && data.catName[0]).appendTo(info);
        brand = $('<span class="brand">').html(data.brand && data.brand_value).appendTo(info);
        desc = $('<span class="desc">').html(data.description).appendTo(info);

        return col;
    };


    Dolphin.template.productGridTemplate = productGridTemplate;
})(jQuery);