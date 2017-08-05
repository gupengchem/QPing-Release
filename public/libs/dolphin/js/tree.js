(function($){
	var thisTool = Dolphin;
	function TREE(param){
		this.init(param);
	}
	TREE.defaults = {
		id : null										,	//随机id
		url : null,
		data : null,
		panel:"body",

		idField : 'id',
		nameField : 'name',

		queryParams : null,
		ajax : thisTool.ajax,
		defaultId : -1,
		requestKey : 'id',

		checkbox : true,
		multiple : true,
		cascadeCheck:true,
		onlyLeafCheck:false,
		clickForCheck : true,

		checkedOverCurPage : false,							//分页选中
		checkedData : [],

		onload : null,
		onClick : null,
		onQuery : null,
		onChecked : null,

		icon : {
			folder_open : 'glyphicon glyphicon-folder-open',
			folder_close : 'glyphicon glyphicon-folder-close',
			file : 'glyphicon glyphicon-file'
		}
	};

	TREE.prototype = {
		/* ==================== property ================= */
		constructor : TREE,
		data : null,

		lastQueryStr : null,
		queryResult : null,
		queryCount : null,

		
		/* ===================== method ================== */
		init : function(param){
			this.opts = $.extend({}, TREE.defaults, param);
			if(!this.opts.id){
				this.opts.id = Math.round(Math.random() * Math.pow(10,6));
			}
			
			if(this.opts.data){
				this.loadData(this.opts.data);
				this.initData(this.data, null);
				this.render(this.data, $(this.opts.panel));
				if(typeof this.opts.onLoad == 'function'){
					this.opts.onLoad.call(this);
				}
			}else if(this.opts.url){
				this.load(function(data){
					this.initData(this.data, null);
					this.render(this.data, $(this.opts.panel));
					if(typeof this.opts.onLoad == 'function'){
						this.opts.onLoad.call(this);
					}
				});
			}
		},
		reload : function(){
			this.load(function(data){
				this.initData(this.data, null);
				this.render(this.data, $(this.opts.panel));

				if(typeof this.opts.onLoad == 'function'){
					this.opts.onLoad.call(this);
				}
			});
		},
		empty : function(){
			$(this.opts.panel).empty();
		},
		loadData : function(newData){
			this.data = newData;
		},
		load : function(callback){
			var thisTree = this;
			var queryCondition = $.extend({}, this.opts.queryParams);
			var _url = this.opts.url.replace('{'+this.opts.requestKey+'}', this.opts.defaultId);
			this.opts.ajax({
				url : _url,
				data : queryCondition,
				mockPathData : this.opts.mockPathData,
				onSuccess : function(data){
					thisTree.data = data.rows;
					if(typeof callback == 'function'){
						callback.call(thisTree, data);
					}
				},
				onError : function(data){
					thisTree.data = [];
				}
			});
		},
		initData : function(dataList, _parent){
			var thisTree = this;
			var callee = arguments.callee;
			$.each(dataList, function(i, data){
				if(_parent != null){
					data._parent = _parent;
				}
				if(typeof thisTree.opts.dataFilter == 'function'){
					data = thisTree.opts.dataFilter.call(thisTree, data);
				}

				if(data.children){
					callee.call(thisTree, data.children, data);
				}
			});
		},
		render : function(nodeList, panel){
			var thisTree = this;
			
			panel.addClass('Dolphin-tree');
			panel.empty();
			
			var callee = arguments.callee;
			var table = $("<table></table>").attr("id", thisTree.opts.id + "_grid").addClass("tree-table").appendTo(panel);
			var tbody = $("<tbody></tbody>").attr("id", thisTree.opts.id + "_body").appendTo(table);
			
			$.each(nodeList, function(i, node){
				var treeItem = $("<tr>").addClass("treeItem").attr('itemType', node.type).appendTo(tbody);
				node.target = treeItem;
				
				//节点图标
				var treeItemIcon = $("<td>").css({width:"20px"}).appendTo(treeItem);
				if(node.type == 'folder'){
					treeItemIcon.html('<span class="'+thisTree.opts.icon.folder_close+' toggleIcon" aria-hidden="true"></span>');
				}else{
					treeItemIcon.html('<span class="'+thisTree.opts.icon.file+'" aria-hidden="true"></span>');
				}
				
				//复选框
				if(thisTree.opts.checkbox){
					if(thisTree.opts.onlyLeafCheck && node.type == 'folder'){
						$("<td>").css({width:"20px"}).appendTo(treeItem);
					}else{
						var treeItemCheckbox = $("<td>").css({width:"20px"}).appendTo(treeItem);
						var itemCheckbox = $('<input id="' + thisTree.opts.id + '_item_1" name="'+thisTree.opts.id+'selectedItem" class="selectedItem" title="'+thisTree.getName(node)+'" style="margin-top: 0px;" >');
						itemCheckbox.attr('type', (thisTree.opts.multiple ? 'checkbox' : 'radio')).val(node[thisTree.opts.idField]).appendTo(treeItemCheckbox);
					}
				}

				var treeItemLabel = $("<td>").addClass('tree-label').html(thisTree.getName(node)).appendTo(treeItem);
				if(node.type == 'folder' && node.children){
					var childrenItemTr = $('<tr class="treeChildren" hidden >').appendTo(tbody);
					node.childrenTarget = childrenItemTr;
					var childrenItem = $('<td style="padding-left: 20px;padding-right: 0px;" colspan="3">').appendTo(childrenItemTr);
					callee.call(thisTree, node.children, childrenItem);
					node.hasLoadChildren = true;
				}else{
					node.hasLoadChildren = false;
				}

				//bind function
				if(thisTree.opts.onClick){
					treeItemLabel.bind('click', function(){
						thisTree.opts.onClick.call(thisTree, node);
					});
				}
				if(thisTree.opts.checkbox && thisTree.opts.clickForCheck){
					treeItem.bind('click', function(event){
						if(event.target.tagName.toLowerCase() !== 'input' && event.target.tagName.toLowerCase() !== 'select' && event.target.tagName.toLowerCase() !== 'button' && event.target.tagName.toLowerCase() !== 'a' && !$(event.target).hasClass('toggleIcon')){
							if(thisTree.opts.multiple){
								thisTool.toggleCheck(itemCheckbox);
							}else{
								thisTool.toggleCheck(itemCheckbox, true);
							}
						}
					});
				}
				if(thisTree.opts.checkbox){
					itemCheckbox.bind('change.onChekced', function(){
						if(this.checked){
							if(typeof thisTree.opts.onChecked === 'function'){
								thisTree.opts.onChecked.call(thisTree, node);
							}
						}else{
							if(typeof thisTree.opts.onUnChecked === 'function'){
								thisTree.opts.onUnChecked.call(thisTree, node);
							}
						}
						if(typeof thisTree.opts.onCheck === 'function'){
							thisTree.opts.onCheck.call(thisTree, node, this);
						}
					});
				}


				//切换子节点显示隐藏
				treeItem.find(".toggleIcon").click(function(){
					if($(this).hasClass(thisTree.opts.icon.folder_close)){
						thisTree.expend(node);
					}else{
						thisTree.collapse(node);
					}
				});

				//操作选中数据
				if(thisTree.opts.checkedOverCurPage && itemCheckbox){
					itemCheckbox.bind('change.checkedData', function(event) {
						if (this.checked) {
							if(!thisTool.objInArray(node, thisTree.opts.checkedData, function (a, b) {
									return a[thisTree.opts.idField] === b[thisTree.opts.idField];
								})){
								thisTree.opts.checkedData.push(node);
							}
						} else {
							thisTree.opts.checkedData.splice(thisTool.objIndexOfArray(node, thisTree.opts.checkedData, function (a, b) {
								return a[thisTree.opts.idField] === b[thisTree.opts.idField];
							}), 1);
						}
					});
				}
				//复选框，父子联动
				if(thisTree.opts.checkbox && thisTree.opts.cascadeCheck && thisTree.opts.multiple && !thisTree.opts.onlyLeafCheck){
					itemCheckbox.bind('change.parent', function(){
						var childrenItem = $(this).closest(".treeChildren");
						if(childrenItem.length != 0){
							var selectedItem = childrenItem.prev().find(".selectedItem");
							if(this.checked){
								var thisItem = $(this).closest(".treeItem");
								var items = thisItem.siblings(".treeItem");
								var allChecked = true;
								$.each(items, function(i, item){
									if($(item).find(".selectedItem")[0].checked == false){
										allChecked = false;
										return false;
									}
								});
								if(allChecked){
									selectedItem[0].checked = true;
									selectedItem.triggerHandler("change.checkedData");
								}
							}else{
								selectedItem[0].checked = false;
								selectedItem.triggerHandler("change.checkedData");
							}
							selectedItem.triggerHandler("change.parent");
						}
					}).bind('change.children', function(){
						var thisCheckbox = this;
						var thisItem = $(this).closest(".treeItem");
						if(thisItem.attr('itemType') == 'folder'){
							var childrenItem = thisItem.next();
							if(childrenItem.length != 0){
								childrenItem.find(".selectedItem").each(function(){
									this.checked = thisCheckbox.checked;
									$(this).triggerHandler("change.checkedData");
								});
							}
						}
					});
				}

				//backfill
				if(thisTree.opts.checkbox){
					if(itemCheckbox && (thisTool.objInArray(node[thisTree.opts.idField], thisTree.opts.checkedData, function(a, b){
							return a == b[thisTree.opts.idField];
						}) || node.__checked)){
						itemCheckbox.attr('checked', 'checked').change();
					}
				}
			});
		},
		find : function(queryStr, dataSource){
			var thisTree = this;
			var callee = arguments.callee;
			var returnNodeList = [], name;
			dataSource = dataSource || thisTree.data;
			$.each(dataSource, function(i, data){
				if((data[thisTree.opts.idField] && data[thisTree.opts.idField].indexOf(queryStr) >= 0) || (thisTree.getName(data) && thisTree.getName(data).indexOf(queryStr) >= 0)){
					if(thisTree.opts.onlyLeafCheck === false || (thisTree.opts.onlyLeafCheck === true && !(data.children && data.children.length > 0))){
						returnNodeList.push(data);
					}
				}
				
				if(data.children){
					returnNodeList = returnNodeList.concat(callee.call(thisTree, queryStr, data.children));
				}
			});
			
			return returnNodeList;
		},
		findById : function(queryStr, dataSource){
			var thisTree = this;
			var callee = arguments.callee;
			var returnNode = null;
			dataSource = dataSource || thisTree.data;
			for(var i = 0; i < dataSource.length; i++){
				data = dataSource[i];
				if(data[thisTree.opts.idField] == queryStr){
					returnNode = data;
					return returnNode;
				}
				
				if(data.children){
					returnNode = callee.call(thisTree, queryStr, data.children);
					if(returnNode != null){
						break;
					}
				}
			}
			
			return returnNode;
		},
		findByIds : function(queryIds, dataSource){
			var thisTree = this;
			var callee = arguments.callee;
			var returnNodeList = [];
			dataSource = dataSource || thisTree.data;
			$.each(dataSource, function(i, data){
				if(thisTool.objInArray(data[thisTree.opts.idField], queryIds)){
					returnNodeList.push(data);
				}
				
				if(data.children){
					returnNodeList = returnNodeList.concat(callee.call(thisTree, queryIds, data.children));
				}
			});
			
			return returnNodeList;
		},
		findByText : function(queryStr){
			
		},
		expend : function(node){
			var thisTree = this, _url, queryParams;
			node.target.find('.toggleIcon').removeClass(thisTree.opts.icon.folder_close);

			if(!node.hasLoadChildren){
				_url = this.opts.url.replace('{'+this.opts.requestKey+'}', node[this.opts.idField]);
				queryParams = {};
				queryParams[this.opts.requestKey] = node[this.opts.idField];
				this.opts.ajax({
					url : _url,
					mockPathData : this.opts.mockPathData,
					data : queryParams,
					onSuccess : function(returnData){
						var childrenData = returnData.rows;
						thisTree.initData(childrenData, node);

						node.children = childrenData;

						var childrenItemTr = $('<tr class="treeChildren" hidden>');
						node.target.after(childrenItemTr);
						node.childrenTarget = childrenItemTr;
						var childrenItem = $('<td style="padding-left: 20px;padding-right: 0px;" colspan="3">').appendTo(childrenItemTr);
						thisTree.render(node.children, childrenItem);
						node.hasLoadChildren = true;

						node.target.find('.toggleIcon').addClass(thisTree.opts.icon.folder_open);
						node.target.next().toggle();
					}
				});
			}else{
				node.target.find('.toggleIcon').addClass(thisTree.opts.icon.folder_open);
				node.target.next().toggle();
			}
		},
		expandTo : function(node){
			var thisTree = this;
			var callee = arguments.callee;
			if(node && node._parent){
				node._parent.target.next().show();
				node._parent.target.find(".toggleIcon").removeClass(thisTree.opts.icon.folder_close).addClass(thisTree.opts.icon.folder_open);
				
				callee.call(thisTree, node._parent);
			}
		},
		expandAll : function(){
			$(this.opts.panel).find(".toggleIcon").removeClass(this.opts.icon.folder_close).addClass(this.opts.icon.folder_open);
			$(this.opts.panel).find("tr.treeChildren").show();
		},
		collapse : function(node){
			node.target.find('.toggleIcon').toggleClass(this.opts.icon.folder_close).toggleClass(this.opts.icon.folder_open);
			node.target.next().toggle();
		},
		collapseAll : function(){
			$(this.opts.panel).find(".toggleIcon").removeClass(this.opts.icon.folder_open).addClass(this.opts.icon.folder_close);
			$(this.opts.panel).find("tr.treeChildren").hide();
		},
		scrollTo : function(node){
			if(node){
				node.target.find('input').eq(0).focus();
			}
		},
		hightLight : function(node){
			if(node){
				node.target.addClass("highLight");
			}
		},
		cleanHightLight : function(){
			$(this.opts.panel).find(".treeItem.highLight").removeClass("highLight");
		},
		query : function(queryStr){
			if(this.lastQueryStr == queryStr){
				if(this.queryCount < this.queryResult.length){

				}else{
					this.queryCount = 0;
				}
			}else{
				this.queryResult = this.find(queryStr);
				this.queryCount = 0;
				this.lastQueryStr = queryStr;
			}
			this.collapseAll();
			this.cleanHightLight();

			this.hightLight(this.queryResult[this.queryCount]);
			this.expandTo(this.queryResult[this.queryCount]);

			if(typeof this.opts.onQuery === 'function'){
				this.opts.onQuery.call(this, this.queryResult, this.queryCount);
			}

			this.queryCount++;
		},
		check : function(node, changeFlag){
			if(node){
				node.target.find('.selectedItem')[0].checked = true;
				if(changeFlag){
					node.target.find('.selectedItem').change();
				}
			}
		},
		uncheck : function(node){
			if(node){
				node.target.find('.selectedItem')[0].checked = false;
				if(changeFlag){
					node.target.find('.selectedItem').change();
				}
			}
		},
		getChecked : function(){
			var thisTree = this;
			if(thisTree.opts.checkedOverCurPage){
				return this.opts.checkedData;
			}else{
				var selectedItemList = $(this.opts.panel).find('.selectedItem:checked');
				 var checkedList = [], returnData = [];
				 for(var i = 0; i < selectedItemList.length; i++){
				 	checkedList.push(selectedItemList.eq(i).val());
				 }

				 returnData = this.findByIds(checkedList);

				 return returnData;
			}
		},
		getName : function (data) {
			var _this = this, name;
			if(typeof _this.opts.nameField == 'function'){
				name = _this.opts.nameField.call(_this, data);
			}else{
				name = data[_this.opts.nameField];
			}
			return name;
		}
	};
	thisTool.TREE = TREE;
})(jQuery)