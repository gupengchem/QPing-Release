(function($){
	var thisTool = Dolphin;
	function I18N_BOX(thisPanel, param){
		this.init(thisPanel, param);

		return this;
	}
	I18N_BOX.defaults = {
		//required
		panel : null,								//
		name : null,

		//options
		langOption : ['zh', 'en'],
		defaultLang : navigator.language,
		prefixName : '',
		suffixName : '',

		value : null,
		code : null,

		//icon
		icon : {
			toggle_button : "glyphicon glyphicon-globe",
			toggle_button_hide : "icon-chevron-down",
			toggle_button_show : "icon-chevron-up"
		},
		toggleTime : 300,

		//event
		onChange : null												//function(lang, value, thisInput)
	};



	I18N_BOX.prototype = {
		/* ==================== property ================= */
		constructor : I18N_BOX,
		name : null,
		panel : null,

		/* ===================== method ================== */
		init : function(thisPanel, param){
			this.opts = $.extend({}, I18N_BOX.defaults, param);
			this.panel = thisPanel;
			if(!this.opts.defaultLang){
				this.opts.defaultLang = this.opts.langOption[0];
			}
			this.name = this.opts.name || this.panel.children('input[type="hidden"]').attr('name');

			this.render();

			return this;
		},

		render : function(){

			var _this = this,
				mainLang, toggleButton, langPanel, item, i18nInputPanel,
				i;

			this.panel.attr('controlName', this.name);
			this.panel.children('input[type="hidden"]').remove();
			mainLang = $('<div class="input-group">').appendTo(this.panel);
			$('<span class="input-group-addon">').html(_this.renderLang(_this.opts.defaultLang)).appendTo(mainLang);
			//TODO
			$('<input type="text" class="form-control">').attr("name", _this.opts.prefixName + _this.name + _this.opts.suffixName + "." + _this.opts.defaultLang).val(_this.opts.value).bind('change', function (e) {
				_this.change.call(_this, _this.opts.defaultLang, this.value, this);
			}).appendTo(mainLang);
			toggleButton = $('<span class="input-group-addon">').click(function () {
				var __this = this;
				var code = $(__this).children("input").val();
				var flag = $(__this).attr('__i18n_flag');
				if(code && !flag){
					thisTool.i18n.load(code, {
						mockPathData : ["categoryName"],
						callback : function(reData){
							for(k in reData.value){
								langPanel.find('[name$=".'+k+'"]').val(reData.value[k]);
							}
							langPanel.slideToggle(_this.opts.toggleTime);
							$(__this).attr('__i18n_flag', true);
						}
					});
				}else{
					langPanel.slideToggle(_this.opts.toggleTime);
				}
			}).appendTo(mainLang);
			$('<span>').addClass(_this.opts.icon.toggle_button).appendTo(toggleButton);
			$('<input type="hidden">').attr("name", _this.opts.prefixName + _this.name + _this.opts.suffixName + "." + 'code').val(_this.opts.code).appendTo(toggleButton);

			langPanel = $('<div class="_lang_items default-hidden">').appendTo(_this.panel);
			$.each(_this.opts.langOption, function (i, lang) {
				if(lang != _this.opts.defaultLang){
					item = $('<div class="_lang_item">').appendTo(langPanel);
					i18nInputPanel = $('<div class="input-group">').appendTo(item);

					$('<span class="input-group-addon">').html(_this.renderLang(lang)).appendTo(i18nInputPanel);
					$('<input type="text" class="form-control">').attr("name", _this.opts.prefixName + _this.name + _this.opts.suffixName + "." + lang).bind('change', function (e) {
						_this.change.call(_this, lang, this.value, this);
					}).appendTo(i18nInputPanel);
				}
			});

			return _this;
		},

		change : function (lang, value, thisInput) {
			var _this = this;
			if(typeof _this.opts.onChange === 'function'){
				_this.opts.onChange.call(_this, lang, value, thisInput);
			}
		},

		renderLang : function(code){

			return code;
		}

	};

	$.fn.i18nBox = function (param) {
		var thisControl, thisFunc;
		if(typeof param == 'string'){
			thisControl = this.eq(0).data('dolphin');
			if(thisControl){
				thisFunc = this.eq(0).data('box')[param];
				if(typeof thisFunc === 'function'){
					return thisFunc.apply(thisControl, arguments.slice(1));
				}
			}
			console.log('I18N_BOX has no such function : '+ param);
			return false;
		}else{
			this.each(function () {
				if($(this).data('dolphin')){

				}else{
					$(this).data('dolphin', new I18N_BOX($(this), param));
				}
			});
			return this;
		}
	};

	thisTool.I18N_BOX = I18N_BOX;
})(jQuery);