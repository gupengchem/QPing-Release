(function ($) {
    var thisTool = Dolphin;

    function FORM(param) {
        this.init(param);
    }

    FORM.defaults = {
        panel: 'body',
        ajax: thisTool.ajax,
        formatter: null,
        ignore: "",

        select: {
            emptyOption: true,
            codeField: 'code',
            nameField: 'name',
            optionUrl: null,
            optionParam: null,
            ajaxType: 'get'
        },

        renderForm: {
            staticFlag: false,
            colPreRow: 2,
            labelCol: 6,
            inputTypeKey: 'inputType',
            labelKey: "label",
            nameKey: 'attrCode',
            codeField: 'attrCode',
            idField: 'attrId',
            selectOptionsKey: 'subType',
            eachField: null								//function 渲染字段前触发，返回false时，跳过此字段
        }
    };


    FORM.prototype = {
        /* ==================== property ================= */
        constructor: FORM,
        data: null,

        /* ===================== method ================== */
        init: function (param) {
            this.opts = $.extend({}, FORM.defaults, param);
        },
        parse: function (panel) {
            var _panel = panel || this.opts.panel;
            //select
            this.parseSelect($(_panel).find('select[options]'));

            //date
            $(_panel).find('.input-group.dolphin_date_picker').datepicker({
                format: "yyyy-mm-dd",
                language: navigator.language,
                autoclose: true,
                orientation: "bottom left"
            });

            //datetime
            $(_panel).find('.input-group.dolphin_datetime_picker').datetimepicker({
                format: "yyyy-mm-dd hh:ii",
                autoclose: true,
                pickerPosition: "bottom-left"
            });

            //i18n
            $(_panel).find('.dolphin_i18n_box').each(function () {
                $(this).i18nBox();
            });

            //ref-tree
            $(_panel).find('.form-control-ref').each(function () {
                var thisControl = $(this);
                var url = thisTool.path.contextPath + thisControl.attr('data-ref-url');
                var idField = thisControl.attr('idField');
                var nameField = thisControl.attr('nameField');

                var refTree = new REFWIN({
                    type: thisControl.attr('data-ref-type'),
                    url: url,
                    mockPathData: thisControl.attr('mockPathData').split(","),

                    idField: idField || 'code',
                    textField: nameField || 'name',

                    multiple: thisControl.attr('data-ref-multiple') === "true" ? true : false,
                    checkbox: thisControl.attr('data-ref-checkbox') === "false" ? false : true,
                    cascadeCheck: thisControl.attr('data-ref-cascadeCheck') === "true" ? true : false,
                    onlyLeafCheck: thisControl.attr('data-ref-onlyLeafCheck') === "true" ? true : false,
                    onShow: function () {
                        var selected = thisControl.find('.form-control-hidden').val().split(',');

                        for (var i = 0; i < selected.length; i++) {
                            this.refObj.check(this.refObj.findById(selected[i]));
                        }
                    },
                    onSubmit: function (data) {
                        var selectNode = '';
                        var selectId = '';
                        for (var i = 0; i < data.length; i++) {
                            if (i != 0) {
                                selectNode += ', ';
                                selectId += ', ';
                            }
                            selectNode += data[i][this.opts.textField];
                            selectId += data[i][this.opts.idField];
                        }
                        thisControl.find('.form-control').val(selectNode);
                        thisControl.find('.form-control-hidden').val(selectId);
                    }
                });
                thisControl.find('.input-group-addon').bind('click', function () {
                    //console.log(tree.getChecked());
                    refTree.show();
                });
            });

            //file
            $(_panel).find('.dolphin_file_box').each(function () {
                $(this).fileBox();
            });

            //validate
            thisTool.validate.monitor($(this.opts.panel).find('[' + thisTool.validate.defaults.attr + ']'));

            return this;
        },
        empty: function (panel, param) {
            var thisPanel = panel || this.opts.panel;
            var opts = param || this.opts;
            var control;

            $(thisPanel).find('[name]').each(function () {
                control = $(this);
                if (control[0].tagName.toLowerCase() == 'input') {
                    if (control.attr('type') == 'radio' || control.attr('type') == 'checkbox') {
                        control[0].checked = false;
                    } else {
                        control.val("");
                    }
                } else if (control[0].tagName.toLowerCase() == 'select' || control[0].tagName.toLowerCase() == 'textarea') {
                    control.val("");
                } else if (control[0].tagName.toLowerCase() == 'p' || control[0].tagName.toLowerCase() == 'span' || control[0].tagName.toLowerCase() == 'div') {
                    control.html("");
                }
            });
            $(thisPanel).find('div.dolphin_i18n_box').each(function () {
                $(this).find('[__i18n_flag]').removeAttr('__i18n_flag');
                $(this).find('._lang_items').hide();
            });
        },
        //form --> json
        getValue: function (formId) {
            var _form;
            if (typeof formId === 'string') {
                _form = $(formId);
                if (_form.length == 0) {
                    _form = $("#" + formId);
                }
            } else {
                _form = formId;
            }
            var obj = {}, control,
                nameTree, namePointer,
                i, j, k;

            //select,input,textarea,checkbox,radio
            var item = _form.find('select[name], input[name][type!="checkbox"][type!="radio"], textarea[name], input[name][type="checkbox"]:checked, input[name][type="radio"]:checked');
            for (i = 0; i < item.length; i++) {
                control = item.eq(i);
                if (control.closest('.table-edit').length > 0 || control.attr('type') == 'file') {
                    continue;
                }
                if (control.attr('name').indexOf('.') > 0) {
                    nameTree = control.attr('name').split('.');
                    namePointer = obj;
                    for (j = 0; j < nameTree.length; j++) {
                        if (j != (nameTree.length - 1)) {
                            if (!namePointer[nameTree[j]]) {
                                namePointer[nameTree[j]] = {};
                            }
                            namePointer = namePointer[nameTree[j]];
                        } else {
                            namePointer[nameTree[j]] = control.val();
                        }
                    }
                } else {
                    if(control.is('input[type="checkbox"]')){
                        if(obj[control.attr('name')]){
                            obj[control.attr('name')].push(control.val());
                        }else{
                            obj[control.attr('name')] = [control.val()];
                        }
                    }else{
                        obj[control.attr('name')] = control.val();
                    }
                }
            }

            //list
            var editList = _form.find('.table-edit');
            for (i = 0; i < editList.length; i++) {
                obj[editList.eq(i).attr('tableName')] = editList.data('dolphin').data.rows;

                //TODO i18n 处理多语言问题 待优化
                var i18n_box = editList.eq(i).find('.list_body').children('tr').eq(0).find('.dolphin_i18n_box');
                for (j = 0; j < i18n_box.length; j++) {
                    var field_name = i18n_box.eq(j).attr('controlName');
                    for (k = 0; k < obj[editList.eq(i).attr('tableName')].length; k++) {
                        obj[editList.eq(i).attr('tableName')][k][field_name] = translateI18n(obj[editList.eq(i).attr('tableName')][k][field_name]);
                    }
                }
            }

            //TODO i18n 处理多语言问题 待优化
            _form.find('.dolphin_i18n_box').each(function (i) {
                var control = $(this);
                if (control.closest('.table-edit').length > 0 || control.attr('type') == 'file') {
                    return true;
                } else {
                    var name = control.attr('controlName');
                    obj[name] = translateI18n(obj[name]);
                }
            });
            function translateI18n(data) {
                var i18nData = "";
                for (var key in data) {
                    if (i18nData != "") {
                        i18nData += ","
                    }
                    i18nData += "\"" + key + "\"" + ":" + (data[key] ? "\"" + data[key] + "\"" : "\"\"");
                }

                return i18nData;
            }


            return obj;
        },
        setValue: function (data, panel, param) {
            var _this = this;
            var thisPanel = $(panel || this.opts.panel);
            var opts = $.extend({}, this.opts, param),
                i, key, _key, keyPath = [], control;

            //TODO i18n
            if (data.lang) {
                for (key in data.lang) {
                    data[key + "_i18n_"] = {};
                    data[key + "_i18n_"]['code'] = data.lang[key];
                    data[key + "_i18n_"][Dolphin.I18N_BOX.defaults.defaultLang] = data[key];
                }
            }

            if (opts.ignore) {
                opts.ignore = "," + opts.ignore.join(',') + ",";
            }

            (function (_data, level) {
                for (key in _data) {
                    if (new RegExp(',' + key + ',').test(opts.ignore)
                        || _data[key] instanceof jQuery
                        || _data[key] instanceof HTMLElement
                        || key == "_parent") {
                        continue;
                    }

                    keyPath[level] = key;
                    if (typeof _data[key] != 'object') {
                        _key = "";
                        for (i = 0; i <= level; i++) {
                            if (i > 0) {
                                _key += ".";
                            }
                            _key += keyPath[i];
                        }
                        control = thisPanel.find('[name="' + _key + '"]');
                        _this.setControlValue(control, _data[key], data, param);
                    } else {
                        arguments.callee(_data[key], level + 1);
                    }
                }
            })(data, 0);

            //TODO file
            thisPanel.find('.dolphin_file_box').each(function () {
                $(this).data('dolphin').resetFiles();
            });

            return this;
        },
        setControlValue: function (control, value, data, param) {
            var opts = param || this.opts;
            var key = control.attr('name');

            if (control.length > 0) {
                if (control[0].tagName.toLowerCase() == 'input') {
                    if (control.attr('type') == 'radio' || control.attr('type') == 'checkbox') {
                        if (control.length > 1) {
                            for (var i = 0; i < control.length; i++) {
                                if (control.eq(i).val() == value) {
                                    control[i].checked = true;
                                }
                            }
                        } else {
                            if (value === true || value === "true" || value === "1") {
                                control[0].checked = true;
                            }
                        }
                    } else {
                        control.val(value);
                    }
                } else if (control[0].tagName.toLowerCase() == 'select') {
                    control.val(value + "");
                    control.attr('selectedOption', value + "");
                } else if (control[0].tagName.toLowerCase() == 'textarea') {
                    control.val(value + "");
                } else if (control[0].tagName.toLowerCase() == 'p' || control[0].tagName.toLowerCase() == 'span' || control[0].tagName.toLowerCase() == 'div') {
                    if (control.attr('options')) {
                        control.html(thisTool.enum.getEnumText(control.attr('options'), value));
                    } else {
                        if (opts.formatter && typeof opts.formatter[key] === 'function') {
                            control.html(opts.formatter[key].call(this, value, data));
                        } else {
                            control.html(value);
                        }
                    }
                }
            }
        },
        loadData: function (param, panel, funcParam) {
            var thisForm = this;
            param.onSuccess = function (data) {
                if (typeof funcParam.dataFilter == "function") {
                    data = funcParam.dataFilter.call(thisForm, data);
                }

                thisForm.setValue(data.value, panel, param);

                if (typeof funcParam.callback == "function") {
                    funcParam.callback.call(thisForm, data);
                }
            };
            thisTool.ajax(param);
        },
        validate: function (panel) {
            var _panel = panel || this.opts.panel;

            return thisTool.validate($(_panel).find('[' + thisTool.validate.defaults.attr + ']'));
        },

        /*
         功能：通过json创建表单
         参数说明：
         param : [{name:"", title:"", inputType:"", placeholder:"", labelCol : 2}]
         */
        renderForm: function (fields, panel, param) {
            var thisPanel = panel || this.opts.panel,
                _this = this,
                opts = $.extend(true, {}, this.opts.renderForm, param);

            var row = $('<div class="dolphin-row">').appendTo(thisPanel);

            for (var i = 0; i < fields.length; i++) {
                _this.renderField(fields[i], row, opts);
            }
            return row;
        },
        renderField: function (field, panel, param) {
            var col, formField, label, controlPanel;

            if (typeof param.eachField == 'function') {
                if (param.eachField(field, param) === false) {
                    return false;
                }
            }

            if (field.hidden || field[param.inputTypeKey] == 'hidden') {
                this.renderControlMethod['hidden'](field, param).prependTo(panel);
            } else {
                if (!field[param.idField]) {
                    field[param.idField] = Dolphin.random(8);
                }
                col = $('<div>').addClass('dolphin-col-' + 24 / (field.colPreRow || param.colPreRow)).attr({
                    'attrCode': field[param.codeField],
                    'attrId': field[param.idField]
                });

                formField = $('<div>').addClass('form-group').appendTo(col);
                label = $('<label>').addClass('dolphin-col-' + (field.labelCol || param.labelCol) + ' control-label').html(field[param.labelKey]).appendTo(formField);
                controlPanel = $('<div>').addClass('dolphin-col-' + (24 - (field.labelCol || param.labelCol))).appendTo(formField);

                this.renderControl(field, controlPanel, param);
            }

            if (col && panel) {
                col.appendTo(panel);
            }

            return col;
        },
        renderControl: function (field, panel, param) {
            var _this = this;
            var control, inputType, controlMethod;

            if (typeof field.formatter == 'function') {
                control = field.formatter(field);
            } else {
                if (param.staticFlag === false) {
                    if(typeof param.inputTypeKey == 'function'){
                        inputType = param.inputTypeKey.call(_this, field);
                    }else{
                        inputType = field[param.inputTypeKey];
                    }
                    controlMethod = this.renderControlMethod[inputType];
                    if(typeof controlMethod == 'function'){
                        control = controlMethod.call(this, field, param);
                    }else{
                        control = this.renderControlMethod['text'].call(this, field, param);
                    }
                } else {
                    control = this.renderControlMethod['static'].call(this, field, param);
                }
            }
            if (panel) {
                panel.append(control);
            }
            return control;
        },
        renderControlMethod: {
            text: function (field, param) {
                var control = $('<input type="text" class="form-control"/>').val(field.defautValue || "").attr({
                    'name': field[param.nameKey],
                    'placeholder': field.placeholder || ''
                });

                return control;
            },
            enum: function (field, param) {
                var control = $('<select class="form-control">').attr({
                    'name': field[param.nameKey]
                });
                this.parseSelect(control, {
                    options: field[param.selectOptionsKey]
                });
                return control;
            },
            hidden: function (field, param) {
                var control = $('<input type="hidden" />').val(field.defautValue || "").attr({
                    'name': field[param.nameKey]
                });

                return control;
            },
            static: function (field, param) {
                var control = $('<p class="form-control-static">').attr({
                    name: field[param.nameKey]
                }).html(field.defaultValue || '');

                return control;
            },
            textarea: function (field, param) {
                var control = $('<textarea class="form-control">').attr({
                    name: field[param.nameKey]
                }).html(field.defaultValue || '');

                return control;
            }
        },
        submitForm: function (param) {
            var result = thisTool.ajax({
                url: param.url,
                data: param.data || {},
                type: param.type
            });
            if (result.success) {
                thisTool.alert(result[thisTool.defaults.ajax.returnMsgKey] || "操作成功");
                if (param.callback) {
                    param.callback();
                }
            } else {
                thisTool.alert(result[thisTool.defaults.ajax.returnMsgKey]);
            }
        },
        parseSelect: function (selectors, param) {
            var thisForm = this;
            selectors.each(
                function () {
                    var thisSelect = this, opts = $.extend({}, thisForm.opts.select, param);
                    var options = $(this).attr('options') || opts.options,
                        optionUrl = $(this).attr('optionUrl') || opts.optionUrl,
                        ajaxType = $(this).attr('ajaxType') || opts.ajaxType,
                        optionParam = $(this).attr('optionParam') || opts.optionParam,
                        codeField = $(this).attr('codeField') || opts.codeField,
                        nameField = $(this).attr('nameField') || opts.nameField,
                        nameFormatter = $(this).attr('nameFormatter') || opts.nameFormatter,
                        emptyOption = ($(this).attr('emptyOption') === false || $(this).attr('emptyOption') === "false") ? false : opts.emptyOption,
                        selectedOption = $(this).attr('selectedOption') || opts.selectedOption,
                        mockPathData = $(this).attr('mockPathData') ? $(this).attr('mockPathData').split(",") : opts.mockPathData,
                        dataFilter = $(this).attr('dataFilter') || opts.dataFilter,
                        optionName;

                    if (optionUrl) {
                        if (optionParam) {
                            //urgent, so just like this
                            optionUrl = optionUrl + "?" + optionParam;
                        }
                        options = thisTool.ajax({
                            url: optionUrl,
                            async: false,
                            type: ajaxType,
                            mockPathData: mockPathData
                        });
                        if (dataFilter) {
                            switch (typeof dataFilter) {
                                case "string" :
                                    options = window[dataFilter].call(thisSelect, options);
                                    break;
                                case "function":
                                    options = dataFilter.call(thisSelect, options);
                                    break;
                                default:
                                    break;
                            }
                        } else {
                            options = options.rows;
                        }
                    } else {
                        options = thisTool.enum.getEnum(options);
                    }
                    if (options) {
                        if (emptyOption) {
                            $(this).append(
                                '<option value="">'
                                + '--请选择--' + '</option>');
                        }
                        for (var i = 0; i < options.length; i++) {
                            switch (typeof nameFormatter) {
                                case "string" :
                                    optionName = window[nameFormatter].call(thisSelect, options[i][nameField]);
                                    break;
                                case "function":
                                    optionName = nameFormatter.call(thisSelect, options[i][nameField]);
                                    break;
                                default:
                                    optionName = options[i][nameField];
                                    break;
                            }
                            $(this).append(
                                '<option value="' + options[i][codeField] + '">'
                                + optionName + '</option>');
                        }
                        if (selectedOption) {
                            $(this).val(selectedOption);
                        }
                    }
                    if ($(this).attr('callback')) {
                        window[$(this).attr('callback')].call(this, $(this).val(), options);
                        if ($(this).attr('noChange')) {

                        } else {
                            $(this).bind('change', function () {
                                window[$(thisSelect).attr('callback')].call(this, $(thisSelect).val(), options);
                            })
                        }
                    }
                }
            );
        },
        setOptions: function (param) {
            $.extend(true, this.opts, param);
            return this;
        }
    };

    thisTool.FORM = FORM;
    thisTool.form = new FORM();
})(jQuery);