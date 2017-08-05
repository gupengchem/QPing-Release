(function(){
	var thisTool = Dolphin;
	function TEMPLATE_GRID(param){
		if(this.init(param)){
			if(this.opts.data){
				this.loadData(this.opts.data, true);
			}else if(this.opts.url){
				this.load(true);
			}
		}
	}
	TEMPLATE_GRID.defaults = {
		panel : "#productList",
		url : null,
		data : null,
		checkedData : null,
		idField : 'id',
		queryParams : null,
		ajax : thisTool.ajax,
		ajaxParam : null,

		pagination:true,
		pageSize : 12,
		pageNumber : 1,
		paginationType : "page",
		pageSizeOption : [12, 18, 36],

		loadingFlag : true,

		onLoadSuccess : null,

		template : null
	};


	TEMPLATE_GRID.prototype = {
		/* ==================== property ================= */
		constructor : TEMPLATE_GRID,
		data : null,
		dataPanel : null,
		moreButton : null,
		checkedObj : {},
		pagination : null,
		defaultUnit : null,

		/* ===================== method ================== */
		init : function(param){
			var thisGrid = this;
			if(param.template){
				this.opts = $.extend({}, TEMPLATE_GRID.defaults, param.template.defaults, param);
				$(this.opts.panel).addClass('dolphin_grid');
				this.initCheckedData();

				this.dataPanel = $('<div class="dolphin-row">').appendTo(this.opts.panel);

				if(this.opts.pagination){
					thisGrid.pagination = new thisTool.PAGINATION({
						type : thisGrid.opts.paginationType,
						panel : thisGrid.opts.panel,
						pageNumber : thisGrid.opts.pageNumber,
						pageSize : thisGrid.opts.pageSize,
						pageSizeOption : thisGrid.opts.pageSizeOption,
						onChange : function () {
							thisGrid.opts.pageNumber = this.opts.pageNumber;
							thisGrid.opts.pageSize = this.opts.pageSize;
							thisGrid.load(thisGrid.opts.paginationType=="page");
						}
					});
				}

				if(typeof this.opts.template.init == "function"){
					this.opts.template.init.call(this);
				}

				if(this.opts.loadingFlag){
					this.initLoading();
				}

				return this;
			}else{
				thisTool.alert('template参数为空');
			}
		},
		initCheckedData : function(){
			if(this.opts.checkedData){
				for(var i = 0; i < this.opts.checkedData.length; i++){
					this.checkedObj[this.opts.checkedData[i][this.opts.idField]] = this.opts.checkedData[i];
					this.checkedObj[this.opts.checkedData[i][this.opts.idField]].checked = true;
				}
			}
			return this;
		},
		getCheckedData : function(){
			var data = [];
			for(var key in this.checkedObj){
				if(this.checkedObj[key].checked){
					data.push({
						code : key,
						quantity : this.checkedObj[key].quantity,
						price:this.checkedObj[key].price,
						additionPrice:this.checkedObj[key].additionPrice,
						baseNum:this.checkedObj[key].baseNum,
						zsdbl:this.checkedObj[key].divisor,
						promotionId:this.checkedObj[key].promotionId,
						unit:this.checkedObj[key].unit
					})
				}
			}
			return data;
		},
		empty : function(){
			$(this.opts.panel).empty();
			return this;
		},
		loadData : function(newData, emptyFlag){
			this.data = newData;
			this.pagination.initData({
				total : this.data.total
			});
			this.initData(emptyFlag);
			return this;
		},
		load : function(emptyFlag, callback){
			var data = null, thisGrid = this;
			var queryCondition = $.extend({pageSize:this.opts.pageSize, pageNumber : this.opts.pageNumber-1}, this.opts.queryParams);
			if(this.opts.loadingFlag){
				this.loadingPanel.show();
			}

			this.data = this.opts.ajax($.extend({}, this.opts.ajaxParam, {
				url : this.opts.url,
				data : queryCondition,
				onSuccess : function (data) {
					thisGrid.data = data;
					thisGrid.pagination.initData({
						total : data.total
					});
					thisGrid.initData(emptyFlag);
					if(typeof callback == 'function'){
						callback.call(thisGrid, data);
					}
				},
				onComplete : function (XMLHttpRequest, textStatus) {
					if(thisGrid.opts.loadingFlag){
						thisGrid.loadingPanel.hide();
					}
				}
			}));

			return this;
		},
		query : function(queryParams, callback){
			this.opts.queryParams = queryParams;
			this.pageNumber = 1;

			this.load(true, callback);
			return this;
		},
		initData : function(emptyFlag){
			if(emptyFlag){
				$(this.dataPanel).empty();
			}
			if(this.data){
				for(var i = 0; i < this.data.rows.length; i++){
					this.addRow(this.data.rows[i]);
				}
				if(this.opts.pagination){
					this.pagination.refresh();
				}

				if(typeof this.opts.onLoadSuccess == 'function'){
					this.opts.onLoadSuccess.call(this, this.data);
				}
			}
			return this;
		},
		addRow : function(data){
			var productListItem = this.opts.template.item.call(this, data);

			$(this.dataPanel).append(productListItem);
			return this;
		},
		checkItem : function(thisObj, data){
			var itemId = thisObj.value;
			if(this.checkedObj[itemId]){
				this.checkedObj[itemId].checked = thisObj.checked;
			}else{
				this.checkedObj[itemId] = {
					checked : thisObj.checked
				}
			}
			return this;
		},
		changeNum : function(thisObj, data){
			var itemId = $(thisObj).attr('itemId');
			var prices = $(thisObj).attr('itemPrice').split(',');
			var unit = $(thisObj).attr('itemUnit');
			if(this.checkedObj[itemId]){
				$.extend(this.checkedObj[itemId], data, {
					quantity : thisObj.value,
					price : prices[0],
					additionPrice : prices[1],
					baseNum : prices[2],
					divisor : prices[3],
					promotionId : prices[4],
					unit : unit
				});
			}else{
				this.checkedObj[itemId] = $.extend({}, data, {
					quantity : thisObj.value,
					price:prices[0],
					additionPrice:prices[1],
					baseNum:prices[2],
					divisor:prices[3],
					promotionId:prices[4],
					unit : unit
				})
			}
			return this;
		},

		initLoading : function () {
			this.loadingPanel = thisTool.initLoadingPanel(this.opts.panel);
		}
	};

	thisTool.TEMPLATE_GRID = TEMPLATE_GRID;
})();