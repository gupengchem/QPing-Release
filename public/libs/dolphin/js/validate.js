(function($) {
	var thisTool = Dolphin;

	var validate = function(selector, param){
		var thisValidate = arguments.callee;
		var flag = true, thisFlag;
		selector.each(function(){
			var _this = $(this), method, i;
			method = param || _this.attr(thisValidate.defaults.attr);

			switch (thisTool.typeof(method)){
				case "array":
					for(i = 0; i < method.length; i++){
						if(!thisValidate(_this, method[i])){
							flag = false;
							break;
						}
					}
					break;
				case "string":
					var methodArray = method.split(","), funcName, funcArguments;
					for(i = 0; i < methodArray.length; i++){
						funcArguments = methodArray[i].match(/\[\S*\]/g);
						if(funcArguments){
							funcArguments = thisTool.string2json(funcArguments[0]);
						}else{
							funcArguments = [];
						}
						funcArguments.unshift(_this);
						funcName = $.trim(methodArray[i].replace(/\[\S*\]/g, ""));
						if(!thisValidate.check.call(thisValidate, _this, thisValidate.method[funcName], funcArguments)){
							flag = false;
							break;
						}
					}
					break;
				case "function":
					if(!method.call(thisValidate, _this)){
						flag = false;
					}
					break;
				case "object":
					if(!thisValidate.check.call(thisValidate, _this, method, [_this])){
						flag = false;
					}
					break;
			}
		});

		return flag;
	};

	validate.defaults = {
		attr : "dol-validate"
	};

	validate.check = function(selector, checkMethod, params){
		var content = null, label, i, flag;
		if(checkMethod.validator.apply(this, params)){
			this.hide(selector);
			flag = true;
		}else{
			label = selector.attr('dol-label') || selector.closest('.form-group').find('label').html() || '';
			switch (typeof checkMethod.message){
				case "function":
					content = checkMethod.message.apply(this, [label].concat(params));
					break;
				case "string":
					content = checkMethod.message.replace("{label}", label);
					for(i = 1; i < params.length; i++){
						content = content.replace("{"+i+"}", params[i]);
					}
					break;
			}
			this.show(selector, content);
			flag = false;
		}

		return flag;
	};
	validate.show = function(_this, content){
		var group = _this.closest('.form-group');
		if(group.length == 0){
			group = _this.closest('.input-group');
		}
		group.addClass('has-error');
		_this.popover('destroy');
		setTimeout(function(){
			_this.popover({
				content : content,
				trigger : 'hover',
				placement : 'top'
			});
		}, 200);
	};

	validate.hide = function(_this){
		var group = _this.closest('.form-group');
		if(group.length == 0){
			group = _this.closest('.input-group');
		}
		group.removeClass('has-error');
		_this.popover('destroy');
	};

	validate.monitor = function(selector, param){
		var thisValidate = this, _selector = selector || $('['+thisValidate.defaults.attr+']');
		_selector.bind('blur', function(){
			thisValidate($(this), param);
		}).bind('keyup', function(){
			thisValidate($(this), param);
		});
	};

	validate.method = {};
	validate.method.required = {
		validator : function(selector){
			if(selector.val()){
				return true;
			}else{
				return false;
			}
		},
		message : "{label}不能为空"
	};

	validate.method.later = {
		validator : function(selector, otherDateId){
			var otherDate = thisTool.string2date($(otherDateId).val());
			var thisDate = thisTool.string2date(selector.val());
			if(thisTool.compareDate(thisDate, otherDate) < 0){
				return false;
			}else{
				return true;
			}
		},
		message : "结束时间不能早于开始时间"
	};
	validate.method.before = {
		validator : function(selector, otherDateId){
			var otherDate = thisTool.string2date($(otherDateId).val());
			var thisDate = thisTool.string2date(selector.val());
			if(thisTool.compareDate(thisDate, otherDate) > 0){
				return false;
			}else{
				return true;
			}
		},
		message : "开始时间不能晚于结束时间"
	};

	validate.method.maxLength = {
		validator : function(selector, maxLength){
			if(selector.val() && selector.val().length > maxLength){
				return false;
			}else{
				return true;
			}
		},
		message : "{label}长度不能超过{1}"
	};
	validate.method.minLength = {
		validator : function(selector, minLength){
			if(selector.val() && selector.val().length < minLength){
				return false;
			}else{
				return true;
			}
		},
		message : function(label, selector, length){
			return label + "长度不能低于" + length;
		}
	};
    validate.method.email = {
        validator : function(selector, minLength){
            if(selector.val() && !/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(selector.val())){
                return false;
            }else{
                return true;
            }
        },
        message : function(label, selector){
            return label + "格式不正确";
        }
    };
	validate.method.number = {
		validator : function(selector, minLength){
			if(selector.val() && !/^(0|[1-9][0-9]*)$/.test(selector.val())){
				return false;
			}else{
				return true;
			}
		},
		message : function(label, selector){
			return label + "必须为数字";
		}
	};

	thisTool.validate = validate;
})(jQuery);