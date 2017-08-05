(function($){
	var thisTool = Dolphin;
	function LIST(param){
		this.init(param);
		if(this.opts.data){
			this.loadData(this.opts.data);
		}else if(this.opts.url){
			this.load();
		}
	}
	LIST.defaults = {
		id : null,											//随机id TODO
		panel : "#testList",								//生成区别，遵循jQuery选择器规则
		columns : null,										//列属性，[{code:"", title:"", width:"", formatter:function(val, row, index){}, orderFlag:boolean, groupFlag:boolean, children:[]}]
		hideHeader : false,									//是否隐藏表头
		striped : true,										//是否隔行变色
		bordered : true,									//是否有边框
		hover : true,										//是否鼠标移上时变色
		rowIndex : true,									//是否带行号
		checkbox : true,									//是否有选择框
		multiple : true,									//是否多选
		clickForCheck : true,								//单击行时是否切换选择状态
		width : null,										//列表总宽度
		height : null,										//列表总高度

		title : null, 										//列表标题
		panelType : 'panel-primary',						//面板颜色
		titleIcon : 'glyphicon-list',						//表头图标

		groupIcon : {										//分组图标 TODO
			group : 'glyphicon-list',
			unGroup : 'glyphicon-tags'
		},
		orderIcon : {										//排序图标
			no : 'glyphicon-sort',
			asc : 'glyphicon-sort-by-attributes',
			desc : 'glyphicon-sort-by-attributes-alt'
		},

		data : null,										//前台数据{total:40, rows:[]}
		idField : 'id',										//
		url : null,											//远程数据url
		queryParams : null,									//查询条件
		sortName : null,									//排序属性
		sortOrder : null,									//排序方式
		sortFlag : false,									//默认是否带排序
		ajax : thisTool.ajax,								//统一ajax事件 TODO
		ajaxType : "get",									//ajax默认提交类型
		pathData : null,									//路径参数

		pagination:true,									//是否带分页，分页请求参数pageSize, pageNumber
		pageSize:10,										//每页条数
		pageNumber:1,										//当前页数
		paginationClass:null,								//分页条class
		pageSizeOption:[5, 10, 20, 50],						//每页显示条数选项
		paginationSimpleFlag:false, 						//简化分页条

		editFlag : false,									//可编辑列表 TODO
		editListName : 'tableName',							//属性名称 TODO

		checkedOverCurPage : false,							//分页选中 TODO
		checkedData : null,									//初始选中状态 TODO

		onClick : null,										//单击行事件
		onCheck : null,										//选中状态切换事件
		onChecked : null,									//选中事件
		onUnchecked : null,									//取消选中事件
		onLoad : null,										//列表加载完成时调用
		onLoadSuccess : null,								//列表加载成功时调用 TODO
		dataFilter : null,									//请求事件过滤
		onAddRow : null,									//列表编辑，添加行时触发 TODO
		onRemoveRow : null,									//列表编辑，删除行时触发 TODO

		mockPathData : null,								//测试数据
		loadingFlag : true,									//加载状态

		__id__ : null										//虚拟id
	};

	LIST.prototype = {
		/* ==================== property ================= */
		constructor : LIST,
		__columns : null,
		data : null,
		pagination : null,
		tbody : null,
		panelTitleDOM : null,
		groupCount : 0,
		groupCode : null,


		/* ===================== method ================== */
		init : function(param){
			var thisList = this,
				panel, panelHeader, panelTitle;
			this.opts = $.extend({}, LIST.defaults, param);

			$(this.opts.panel).data('dolphin', thisList);

			if(!this.opts.id){
				this.opts.id = Math.round(Math.random() * Math.pow(10,6));
			}

			if(this.opts.title){
				panel = $('<div class="panel">').addClass(this.opts.panelType).appendTo(this.opts.panel);

				panelHeader = $('<div class="panel-heading">').appendTo(panel);
				thisList.panelTitleDOM = $('<h3 class="panel-title">').appendTo(panelHeader);
				$('<span class="glyphicon">').addClass(this.opts.titleIcon).appendTo(thisList.panelTitleDOM);
				thisList.panelTitleDOM.append(" ");
				thisList.panelTitleDOM.append(this.opts.title);
			}else{
				panel = $(this.opts.panel);
			}

			var div = $('<div class="list-table">').addClass('dolphin_list').appendTo(panel);
			var table = $('<table>').addClass('table').appendTo(div);
			//table-style
			if(this.opts.width){
				div.css({
					'width': this.opts.width
				});
			}
			if(this.opts.height){
				div.css('height', this.opts.height);
			}
			if(this.opts.maxHeight){
				div.css('max-height', this.opts.maxHeight);
			}
			if(this.opts.striped){
				table.addClass('table-striped');
			}
			if(this.opts.bordered){
				table.addClass('table-bordered');
			}
			if(this.opts.hover){
				table.addClass('table-hover');
			}
			if(this.opts.editFlag){
				$(this.opts.panel).addClass('table-edit');
				$(this.opts.panel).attr('tableName', this.opts.editListName);
			}
			//table-header
			this.initTheader(table);

			//table-body
			this.tbody = $('<tbody class="list_body">').appendTo(table);

			//bind function
			if(this.opts.checkbox && this.opts.multiple){
				table.find('.checkAll').bind('click', function(){
					var checkAll = this;
					table.find('.selectedItem').each(function(){
						this.checked = checkAll.checked;
					});
				});
			}
			if(this.opts.editFlag){
				table.find('.editButtonCol .addRow').bind('click', function(){
					thisList.addRowWithData({}, null);
				});
			}
			if(this.opts.pagination){
				this.pagination = new thisTool.PAGINATION({
					panel : div,
					pageSize : this.opts.pageSize,
					pageNumber : this.opts.pageNumber,
					pageSizeOption : this.opts.pageSizeOption,
					simpleFlag : this.opts.paginationSimpleFlag,
					onChange : function () {
						thisList.opts.pageSize = this.opts.pageSize;
						thisList.opts.pageNumber = this.opts.pageNumber;
						thisList.load();
					}
				});
			}
			if(this.opts.loadingFlag){
				this.initLoading(div);
			}

			return this;
		},
		initTheader : function(tablePanel){
			var table = tablePanel || $(this.opts.panel).find('table');
			var thisList = this,
				tHead, tr, checkAll,
				button, orderButton, groupButton,
				th, checkboxTh, rowIndexTh, editButtonTh,
				header = [], maxLevel;
			this.__columns = [];
			maxLevel = initHeaderData(this.opts.columns, 0).level;

			function initHeaderData(data, level){
				var callee = arguments.callee,
					size = {level : 1, length : 0};
				header[level] = (header[level] || []).concat(data);

				data.forEach(function (d, i) {
					var childrenSize;
					if(d.children){
						childrenSize = callee(d.children, level+1);
						size.level = Math.max(size.level, childrenSize.level+1);
						d.maxLevel = size.level;
						d.colspan = childrenSize.length;
						size.length += childrenSize.length;
					}else{
						size.length++;
						thisList.__columns.push(d);
					}
				});

				data.forEach(function (d, i) {
					if(d.maxLevel){
						d.rowspan = size.level - d.maxLevel + 1;
					}else{
						d.rowspan = size.level;
					}
				});

				return size;
			}

			tHead = $('<thead>');
			if(this.opts.hideHeader){
				tHead.hide();
			}
			tr = $('<tr>').appendTo(tHead);

			if(this.opts.checkbox){
				checkboxTh = $('<th class="checkboxTh" >').attr({
					rowspan : maxLevel
				}).appendTo(tr);
				if(this.opts.multiple){
					checkAll = $( '<input type="checkbox" class="checkAll" />').appendTo(checkboxTh);
				}
			}

			if(this.opts.rowIndex){
				rowIndexTh = $('<th class="rowIndexTh" >').attr({
					rowspan : maxLevel
				}).html('#').appendTo(tr);
			}

			function renderTHeaderCol(column, i, panel){
				th = $('<th>').attr({
					'colCode': column.code,
					'rowspan': column.rowspan,
					'colspan': column.colspan
				}).html(column.title || column.code).appendTo(panel);
				if(column.hidden){
					th.addClass('hiddenCol');
				}
				if(column.orderFlag || thisList.opts.orderFlag){
					orderButton = $('<span class="glyphicon iconButton">').addClass(thisList.opts.orderIcon.no).attr({
						'aria-hidden': true,
						colOrderCode : column.code
					}).bind('click', function(){
						var style = $(this).hasClass(thisList.opts.orderIcon.asc) ? "asc" : ($(this).hasClass(thisList.opts.orderIcon.desc) ? "desc" : "no");
						var code = $(this).attr('colOrderCode');
						table.find('.'+thisList.opts.orderIcon.asc + "," + '.'+thisList.opts.orderIcon.desc)
							.removeClass(thisList.opts.orderIcon.asc).removeClass(thisList.opts.orderIcon.desc);
						switch (style){
							case "no":
								$(this).addClass(thisList.opts.orderIcon.asc);
								thisList.sort(code, "asc");
								break;
							case "asc":
								$(this).addClass(thisList.opts.orderIcon.desc);
								thisList.sort(code, "desc");
								break;
							case "desc":
								thisList.sort(null, null);
								break;
							default :
								console.log("Error in order by " + code);
						}
					}).appendTo(th);
				}
				if(column.groupFlag){
					groupButton = $('<span class="glyphicon iconButton">').addClass(thisList.opts.groupIcon.group).attr({
						'aria-hidden': true,
						colOrderCode : column.code
					}).bind('click', function(){
						if($(this).hasClass(thisList.opts.groupIcon.group)){
							table.find('.'+thisList.opts.groupIcon.unGroup).removeClass(thisList.opts.groupIcon.unGroup).addClass(thisList.opts.groupIcon.group);
							$(this).addClass(thisList.opts.groupIcon.unGroup).removeClass(thisList.opts.groupIcon.group);
							thisList.group($(this).attr('colGroupCode'));
						}else{
							$(this).addClass(thisList.opts.groupIcon.group).removeClass(thisList.opts.groupIcon.unGroup);
							thisList.group(null);
						}
					}).appendTo(th);
				}
			}
			header.forEach(function (headers, i) {
				var panel;
				if(i == 0){
					panel = tr;
				}else{
					panel = $('<tr>').appendTo(tHead);
				}
				headers.forEach(function (column, i) {
					renderTHeaderCol(column, i, panel);
				})
			});

			if(thisList.opts.editFlag){
				editButtonTh = $('<th class="editButtonCol" >').attr({
					rowspan : maxLevel
				}).appendTo(tr);
				button = $('<button type="button" class="btn btn-success btn-xs addRow">').appendTo(editButtonTh);
				$('<span class="glyphicon glyphicon-plus"></span>').appendTo(button);
			}

			table.append(tHead);

			return this;
		},
		initLoading : function (panel) {
			this.loadingPanel = thisTool.initLoadingPanel(panel);
		},
		setColumns : function(columns, param){
			this.opts.columns = columns;
			$.extend(this.opts, param);
			$(this.opts.panel).empty();

			this.init(this.opts);
			if(this.opts.data){
				this.loadData(this.opts.data);
			}else if(this.opts.url){
				this.load();
			}

			return this;
		},
		setTitle : function (title, icon) {
			var _this = this;
			if(_this.opts.title){
				_this.panelTitleDOM.empty();
				$('<span class="glyphicon">').addClass(icon || this.opts.titleIcon).appendTo(_this.panelTitleDOM);
				_this.panelTitleDOM.append(" ");
				_this.panelTitleDOM.append(title || this.opts.title);
			}
			return _this;
		},

		empty : function(){
			this.data = {rows : [], total : 0};
			this.tbody.empty();
			if(this.opts.pagination){
				this.pagination.empty();
			}

			return this;
		},
		loadData : function(newData){
			this.empty();
			this.data = newData;

			if(typeof this.opts.dataFilter === 'function'){
				this.data = this.opts.dataFilter.call(this, newData) || this.data;
			}

			this.groupCount = 0;
			this.groupCode = null;

			if(this.opts.pagination){
				this.pagination.initData({
					total : newData.total,
					pageSize : this.opts.pageSize,
					pageNumber : this.opts.pageNumber
				}).refresh();
			}

			this.initRows();

			if(typeof this.opts.onLoadSuccess === 'function'){
				this.opts.onLoadSuccess.call(this, this.data);
			}
			if(typeof this.opts.onLoad === 'function'){
				this.opts.onLoad.call(this, this.data);
			}

			return this;
		},
		load : function(url, queryParams){
			if(this.opts.loadingFlag){
				this.loadingPanel.show();
			}

			var thisList = this;
			if(url){
				this.opts.url = url;
			}else{
				url = this.opts.url;
			}
			if(queryParams){
				this.opts.queryParams = queryParams;
			}


			this.groupCount = 0;

			var queryCondition = $.extend({}, this.opts.queryParams);
			if(this.opts.pagination){
				url = thisTool.urlAddParam(url,{
					pageSize : this.opts.pageSize,
					pageNumber : this.opts.pageNumber - 1
				});
				// $.extend(queryCondition, {
				// 	pageSize : this.opts.pageSize,
				// 	pageNumber : this.opts.pageNumber - 1
				// });
			}
			if(this.opts.sortName){
				url = thisTool.urlAddParam(url, {
					sortName : this.opts.sortName,
					sortOrder : this.opts.sortOrder
				});
			}
			if(this.groupCode){
				$.extend(queryCondition, {groupCode : this.groupCode});
			}

			var _data;
			if(this.opts.ajaxType=='get'){
				_data = queryCondition;
			} else {
				_data = Dolphin.json2string(queryCondition);
			}

			this.opts.ajax({
				url : url,
				data : _data,
				type : this.opts.ajaxType,
				mockPathData : this.opts.mockPathData,
				pathData : this.opts.pathData,
				onSuccess : function(data, textStatus){
					thisList.empty();

					if(typeof thisList.opts.dataFilter === 'function'){
						data = thisList.opts.dataFilter.call(thisList, data) || data;
					}
					thisList.data = data;
					if(thisList.opts.pagination){
						thisList.pagination.initData({
							total : data.total,
							pageSize : thisList.opts.pageSize,
							pageNumber : thisList.opts.pageNumber
						}).refresh();
					}

					thisList.initRows();

					if(typeof thisList.opts.onLoadSuccess === 'function'){
						thisList.opts.onLoadSuccess.call(thisList, thisList.data);
					}
					if(typeof thisList.opts.onLoad === 'function'){
						thisList.opts.onLoad.call(thisList, thisList.data);
					}
				},
				onComplete : function (XMLHttpRequest, textStatus) {
					if(thisList.opts.loadingFlag){
						thisList.loadingPanel.hide();
					}
				}
			});
			return this;
		},
		reload : function(url, queryParams){
			if(this.opts.pagination){
				this.opts.pageNumber = 1;
			}
			this.load(url, queryParams);

			return this;
		},
		reloadCurPage : function(url, queryParams){  //TODO
			this.load(url, queryParams);

			return this;
		},
		reloadData : function(){
			this.empty();
			this.initRows();

			return this;
		},
		query : function(queryParams, pathData){  //TODO pathData
			this.opts.pageNumber = 1;
			if(queryParams){
				this.opts.queryParams = queryParams;
			}
			if(pathData){
				this.opts.pathData = pathData;
			}
			this.load();

			return this;
		},
		group : function(code){	//TODO
			this.opts.sortName = null;
			this.opts.sortOrder = null;
			this.opts.groupCode = code;
			this.opts.pageNumber = 1;
			this.load();

			return this;
		},
		sort : function(sortName, sortOrder, queryParams){
			this.opts.sortName = sortName;
			this.opts.sortOrder = sortOrder;
			this.opts.groupCode = null;
			this.opts.pageNumber = 1;
			if(queryParams){
				this.opts.queryParams = queryParams;
			}
			this.load();

			return this;
		},
		goPage : function(pageNo){
			this.opts.pageNumber = pageNo;
			this.load();

			return this;
		},

		initRows : function(){
			if(this.opts.checkbox && this.opts.multiple){
				$(this.opts.panel).find('.checkAll')[0].checked = false;
			}

			if(this.data && this.data.rows){
				for(var i = 0; i < this.data.rows.length; i++){
					this.addRow(this.data.rows[i], i+1);
				}
				if(this.opts.pagination){
					this.pagination.refresh();
				}
			}else{

			}
			return this;
		},
		addRow : function(data, rowIndex){
			if(data.__type == "group_total_row"){
				return this.addTotalRow(data, rowIndex);
			}else{
				return this.addDataRow(data, rowIndex);
			}
			return this;
		},
		addRowWithData : function (data, rowIndex) {  //TODO rowIndex
			this.addRow(data, rowIndex);
			this.data.rows.push(data);
			return this;
		},
		addTotalRow : function(data, rowIndex){
			var thisList = this;
			this.groupCount++;

			var row = $('<tr>').addClass('total_row').appendTo(thisList.tbody);

			var colspan = 0, colName = "";
			if(this.opts.checkbox){
				colspan++;
			}
			if(this.opts.rowIndex){
				colspan++;
			}
			for(var i = 0; i < this.__columns.length; i++){
				if(!this.__columns[i].hidden){
					colspan++;
				}
				if(this.__columns[i].code == data.__group_code){
					colName = this.__columns[i].title;
				}
			}

			var col = $('<td>').attr('colspan', colspan).appendTo(row);

			if(typeof this.opts.totalFormatter == 'function'){
				col.append(this.opts.totalFormatter.call(thisList, data, colName));
			}else{
				$('<span class="listGroupTotal">').html(colName + "：" + data.__group_value).appendTo(col);
				$('<span class="listGroupTotal">').html("总计" + "：" + data.__count + "条").appendTo(col);
			}

			return this;
		},
		addDataRow : function(data, rowIndex){
			var thisList = this;
			data.__id__ = thisTool.random(8);

			var row = $('<tr>');
			row.data('data', data).attr("__id__", data.__id__);

			var html = '', col = null;
			if(this.opts.checkbox){
				var checkboxInput = $('<input value="'+data[thisList.opts.idField]+'" name="'+thisList.opts.id+'selectedItem" class="selectedItem" >');
				checkboxInput.attr('type', (thisList.opts.multiple?'checkbox':'radio'));
				//(this.opts.multiple&&typeof(this.opts.check)!= "undefined"&&this.opts.check?'checked':'')

				var checkboxCol = $('<td>').append(checkboxInput).appendTo(row);
			}
			if(this.opts.rowIndex){
				$('<td scope="row">').html(rowIndex - this.groupCount).appendTo(row);
			}
			$.each(this.__columns, function (i, column) {
				var value, valueArr, level, curLevelData;
				col = $('<td>').attr('columnCode', column.code).appendTo(row);
				if(column.width){
					col.css('width', column.width);
				}
				if(column.textAlign){
					col.css('text-align', column.textAlign);
				}
				if(column.wrap){
					col.css('white-space', 'nowrap');
				}
				if(column.hidden){
					col.addClass('hiddenCol');
				}

				if(typeof column.code == "string" && column.code.indexOf('.') > 0){
					valueArr = column.code.split('.');
					value = data;
					for(level = 0; level < valueArr.length; level++){
						if(value == null){
							break;
						}
						value = value[valueArr[level]];
					}
				}else{
					value = data[column.code];
				}

				if(column.formatter){
					col.html(column.formatter.call(col, value, data, rowIndex));
				}else{
					if(thisList.opts.editFlag){
						var inputItem = null;
						switch(column.editType){
							case "select":
								inputItem = $('<select class="form-control">').attr({
									"options" : column.options
								});
								thisTool.form.parseSelect(inputItem);
								break;
							case "number":
								inputItem = $('<input type="number" class="form-control">').attr({
									placeholder : column.title
								});
								break;
							default :
								inputItem = $('<input type="text" class="form-control">').attr({
									placeholder : column.title
								});
						}
						col.html(inputItem);

						inputItem.attr({
							"id" : column.code,
							"listName" : column.code
						});
						if(column.readonly){
							inputItem.attr('readonly', 'readonly');
						}

						if(value){
							inputItem.val(value);
						}

						inputItem.bind('change.binding', function (e) {
							if(column.code.indexOf('.') > 0){
								valueArr = column.code.split('.');
								curLevelData = data;
								for(level = 0; level < valueArr.length; level++){
									if(level == (valueArr.length - 1)){
										curLevelData[valueArr[level]] = this.value;
									}else{
										curLevelData = curLevelData[valueArr[level]];
									}
								}
							}else{
								data[column.code] = this.value;
							}
						});
					}else{
						if(value === undefined || value === null){
							col.html("");
						}else{
							col.html(value + "");
						}
					}
				}
			});

			if(this.opts.editFlag){
				var deleteButton = $('<button type="button" class="btn btn-danger btn-xs removeRow">')
					.html('<span class="glyphicon glyphicon-trash"></span>')
					.click(function (e) {
						if(typeof thisList.opts.onRemoveRow == 'function'){
							if(thisList.opts.onRemoveRow.call(thisList, data, e, row) === false){

							}else{
								removeRow()
							}
						}else{
							removeRow()
						}

						function removeRow(){
							thisList.removeRow(data.__id__);
						}
					});
				$('<td class="editButtonCol">').html(deleteButton).appendTo(row);

			}

			$(thisList.tbody).append(row);

			if(this.opts.checkbox){
				checkboxInput.bind('change', function(event){
					if(thisList.opts.checkedData){
						if(this.checked){
							thisList.opts.checkedData.push(data);
						}else{
							thisList.opts.checkedData.splice(thisTool.objIndexOfArray(data, thisList.opts.checkedData, function(a, b){
								return a[thisList.opts.idField] === b[thisList.opts.idField];
							}), 1);
						}
					}

					if(typeof thisList.opts.onCheck === 'function'){
						thisList.opts.onCheck.call(thisList, data, row, event);
					}
					if(typeof thisList.opts.onChecked === 'function'){
						if(this.checked){
							thisList.opts.onChecked.call(thisList, data, row, event);
						}
					}
					if(typeof thisList.opts.onUnchecked === 'function'){
						if(!this.checked){
							thisList.opts.onUnchecked.call(thisList, data, row, event);
						}
					}
				});
			}
			if(this.opts.checkbox && this.opts.clickForCheck){
				row.bind('click', function(event){
					if(event.target.tagName.toLowerCase() !== 'input' && event.target.tagName.toLowerCase() !== 'select' && event.target.tagName.toLowerCase() !== 'button' && event.target.tagName.toLowerCase() !== 'a'){
						if(thisList.opts.multiple){
							thisTool.toggleCheck(row.find('.selectedItem'));
						}else{
							thisTool.toggleCheck(row.find('.selectedItem'), true);
						}
					}
				});
			}
			if(typeof this.opts.onClick === 'function'){
				row.bind('click', function(event){
					if(!$(event.target).hasClass('selectedItem') && !$(event.target).hasClass('btn')){
						thisList.opts.onClick.call(thisList, data, row, event);
					}
				});
			}

			//backfill
			if(thisList.opts.checkbox
				&& thisList.opts.checkedData
				&& (thisTool.objInArray(data[thisList.opts.idField], thisList.opts.checkedData, function(a, b){
					return a == b[thisList.opts.idField];
				}) || data.__checked === true)){
				checkboxInput.attr('checked', 'checked').change();
			}

			//避免第一条被选中时，勾中全选框
			if(this.opts.checkbox && this.opts.multiple){
				checkboxInput.bind('change', function(event){
					var selectedItem = $(thisList.opts.panel).find('.selectedItem'), checkAllFlag = true;
					for(var i = 0; i < selectedItem.length; i++){
						if(!selectedItem[i].checked){
							checkAllFlag = false;
							break;
						}
					}
					$(thisList.opts.panel).find('.checkAll')[0].checked = checkAllFlag;
				});
			}

			return this;
		},

		removeRow : function(id){ //TODO
			for(var i = 0; i < this.data.rows.length; i++){
				if(this.data.rows[i][this.opts.idField] == id || this.data.rows[i]['__id__'] == id){
					this.data.rows.splice(i, 1);
					if(this.data.total){
						this.data.total--;
					}
					$(this.opts.panel).find("input[type=checkbox][value='"+id+"'],tr[__id__='"+id+"']").closest('tr').remove();
				}
			}
		},
		removeRowsById : function(ids){
			for(var i = 0; i < ids.length; i++){
				this.removeRow(ids[i])
			}
		},
		removeRows : function (data) {
			for(var i = 0; i < data.length; i++){
				this.removeRow(data[i][this.opts.idField]);
			}
		},
		getRows : function () {
			return this.data.rows;
		},

		check : function(id, flag){
			if($.isArray(id)){
				for(var i = 0; i < id.length; i++){
					this.check(id[i], flag);
				}
			}else{
				var checkId = null;
				if(typeof id === "string"){
					checkId = id;
				}else{
					checkId = id[this.opts.idField];
				}
				if(flag === undefined){
					flag = true;
				}
				thisTool.toggleCheck($(this.opts.panel).find('input[value="'+checkId+'"]'), flag);
			}
			return this;
		},
		checkAll : function(flag){
			if(flag === undefined){
				flag = true;
			}
			thisTool.toggleCheck($(this.opts.panel).find('input[value]'), flag);
			this.checkedData  = [];
		},
		getChecked : function(){
			if(this.opts.checkedOverCurPage){
				return this.opts.checkedData;
			}else{
				var thisList = this;
				var selectedItem = $(this.opts.panel).find('.selectedItem:checked');
				var returnData = [];

				for(var i = 0; i < selectedItem.length;i++){
					returnData.push(selectedItem.eq(i).closest('tr').data('data'));
				}

				return returnData;
			}
		},
		length : function () {
			return this.data.rows.length;
		},
		getName : function(data){
			var name;
			if(typeof this.opts.nameField == 'function'){
				name = this.opts.nameField.call(this, data);
			}else{
				name = data[this.opts.nameField];
			}
			return name;
		}
	};

	thisTool.LIST = LIST;
})(jQuery);