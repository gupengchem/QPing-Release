(function($){
	var thisTool = Dolphin;
	var productGridTemplate = {};

	productGridTemplate.defaults = {
		productUnitOption	 : [{"code" : "KAR", name : "箱"}]
	};
	productGridTemplate.init = function(){
		//初始化单位
		this.defaultUnit = this.opts.productUnitOption[0];
		for(var i = 1; i < this.opts.productUnitOption.length; i++){
			if(this.opts.productUnitOption[i].default){
				this.defaultUnit = this.opts.productUnitOption[i];
			}
		}
	};
	productGridTemplate.item = function(data){
		var productListItem = $('<div class="col-sm-4 col-md-3 productListItem">');

		var productBorder = $('<div class="productBorder">').appendTo(productListItem);

		var productImg = $('<div class="productImg">').appendTo(productBorder);
		Dolphin.createImg({
			id : data.id
		}).appendTo(productImg);

		var productInfo1 = $('<div class="row productInfo">').appendTo(productBorder);
		var productInfo1_ = $('<div class="col-xs-12">').appendTo(productInfo1);
		$('<div class="productName">').attr('title',data.shortText).html(data.shortText).appendTo(productInfo1_);
		$('<div class="productCode">').html(data.skuId).appendTo(productInfo1_);

		var productInfo2 = $('<div class="row productInfo">').appendTo(productBorder);
		var productInfo2_ = $('<div class="col-xs-12">').appendTo(productInfo2);
		$('<span class="productPrice">').css('margin-right', '20px').html('单价：' + (data.value1?'￥'+data.value1: '暂无')).appendTo(productInfo2_);
		$('<span class="productPrice">').html('保证金：'+(data.value2?'￥'+data.value2: '暂无')).appendTo(productInfo2_);

		var productInfo3 = $('<div class="row productInfo">').appendTo(productBorder);
		var productInfo3_ = $('<div class="col-xs-12">').appendTo(productInfo3);
		$('<span class="productTransform">').html('箱托转换率：'+(data.divisor? data.divisor+ '箱/托':'暂无')).appendTo(productInfo3_);

		var productCheck = $('<div class="row productCheck">').appendTo(productBorder);
		var productCheckbox = $('<div class="col-xs-6">').appendTo(productCheck);
		var productCheckboxLabel = $('<label class="checkbox-inline">').appendTo(productCheckbox);
		var checkbox = $('<input type="checkbox" class="productItemChecked">').val(data[this.opts.idField]).appendTo(productCheckboxLabel);
		$('<span class="buyButton">').html('购买').appendTo(productCheckboxLabel);
		if(this.checkedObj[data[this.opts.idField]] && this.checkedObj[data[this.opts.idField]].checked){
			checkbox.attr('checked', "checked");
		}
		var productNumber = $('<div class="col-xs-6">').appendTo(productCheck);
		var inputGroup = $('<div class="input-group input-group-sm">').appendTo(productNumber);
		var inputNumber = $('<input type="text" class="form-control productItemNumber">').attr({
			itemId : data[this.opts.idField],
			itemPrice : data["value1"] + ',' + data["value2"] + ',' + data["kwmeng"] + ',' + data["divisor"]+','+data["promotionId_"],
			"aria-describedby" : "basic-addon2"
		}).appendTo(inputGroup);
		if (this.checkedObj[data[this.opts.idField]]) {
			inputNumber.attr({
				itemUnit : this.checkedObj[data[this.opts.idField]].unit
			}).val(this.checkedObj[data[this.opts.idField]].quantity);
		} else {
			inputNumber.attr({
				itemUnit : this.defaultUnit.code,
				readonly : "readonly"
			});
		}
		var unitButton = $('<div class="input-group-btn" id="basic-addon2">').appendTo(inputGroup);
		var button = $('<button type="button" class="btn btn-default dropdown-toggle productItemUnit">').attr({
			"data-toggle" : "dropdown",
			"aria-haspopup" : true,
			"aria-expanded" : false
		}).appendTo(unitButton);
		if (this.checkedObj[data[this.opts.idField]]) {
			button.html(Dolphin.enum.getEnumText('productUnit', this.checkedObj[data[this.opts.idField]].unit));
		}else{
			button.html(this.defaultUnit.name);
		}
		if(this.opts.productUnitOption.length > 1){
			button.append(' ');
			$('<span class="caret">').appendTo(button);
			var unitOption = $('<ul class="dropdown-menu dropdown-menu-right">').appendTo(unitButton);
			for(var i = 0; i < this.opts.productUnitOption.length; i++){
				$('<li>').html('<a href="javascript:void(0)" class="productGridItemUnit" unit="\''+this.opts.productUnitOption[i].code+'\'" >'+this.opts.productUnitOption[i].name+'</a>').appendTo(unitOption);
			}
		}

		//bind function
		var thisPriductGrid = this;
		checkbox.bind('change', function(){
			if(this.checked){
				$(this).closest('.productListItem').find('.productItemNumber').removeAttr('readonly').focus();
			}else
			{
				$(this).closest('.productListItem').find('.productItemNumber').attr('readonly','readonly').val("");
			}
			thisPriductGrid.checkItem(this, data);
		});
		inputNumber.bind('blur', function(){
			var thisInput = $(this);
			var value = thisInput.val();
			if(value != '' && value != parseInt(value)){
				thisInput.popover({
					placement:'top',
					content:'请输入整数。'
				}).popover('show');
				this.focus();
			}else{
				thisInput.popover('destroy');
			}
			thisPriductGrid.changeNum(this, data);
		});
		if(this.opts.productUnitOption.length > 1){
			unitOption.find('.productGridItemUnit').bind('click', function(){
				var thisInput = $(this).closest(".input-group-btn").prev();
				$(this).closest(".dropdown-menu").prev().html($(this).html() + ' <span class="caret"></span>');
				thisInput.attr("itemUnit", $(this).attr("unit"));
				thisPriductGrid.changeNum(thisInput);
			});
		}

		return productListItem;
	}

	Dolphin.template.productGridTemplate = productGridTemplate;
})(jQuery);