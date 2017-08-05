(function($){
	var thisTool = Dolphin;
	function GRID(param){
		this.init(param);
		if(this.opts.data){
			this.loadData();
		}else if(this.opts.url){
			this.load();
		}
	}
	GRID.defaults = {
		id : null,											//生成随机id
		panel : "#planList",
		url : null,
		data : null,
		queryParams : null,
		idField : 'pkId',
		ajax : thisTool.ajax,
		ajaxType : 'get',

		titleFormatter : null,
		operationFormatter : null,
		columns : [],
		checkbox : false,
		multiple : true,
		childrenField : 'children',
		pagination:true,
		pageSize:5,
		pageNum:1,
		pageElements:0,

		onCheck : null,
		dataFilter : null									//请求事件过滤
	};


	GRID.prototype = {
		/* ==================== property ================= */
		constructor : GRID,
		data : null,
		target : [],

		/* ===================== method ================== */
		init : function(param){
			this.opts = $.extend({}, GRID.defaults, param);
			if(!this.opts.id){
				this.opts.id = Math.round(Math.random() * Math.pow(10,6));
			}

			if($(this.opts.panel).children('table').length == 0){
				$('<table>').addClass('grid').append('<tbody></tbody>').appendTo(this.opts.panel);
			}
			if(this.opts.pagination){
				if($(this.opts.panel).children('nav.pagination-nav').length == 0){
					$('<nav>').addClass('pagination-nav').appendTo(this.opts.panel);
				}
			}
		},
		empty : function(){
			$(this.opts.panel).find('tbody, nav').empty();
		},
		loadData : function(newData){
			this.empty();
			this.data = newData;

			this.initRows();
		},
		load : function(){
			this.empty();
			var queryCondition = $.extend({}, this.opts.queryParams);
			var url = this.opts.url;
			if(this.opts.pagination){
				url = thisTool.urlAddParam(this.opts.url,{
					pageSize : this.opts.pageSize,
					pageNum : this.opts.pageNum
				});
			}
			this.opts.ajax({
				url : url,
				data : queryCondition,
				type : this.opts.ajaxType,
				onSuccess : function(data){
					if(typeof this.opts.dataFilter === 'function'){
						data = this.opts.dataFilter.call(this, data);
					}
					this.data = data;
					this.initRows();
				}
			});
		},
		reload : function(){
			this.opts.pageNum = 1;
			this.load();
		},
		query : function(queryParams){
			this.opts.pageNum = 1;
			this.opts.queryParams = queryParams;
			this.load();
		},
		goPage : function(pageNo){
			this.opts.pageNum = pageNo;
			this.load();
		},
		initRows : function(){
			$(this.opts.panel).find('.no-result').remove();
			if(this.data && this.data.rows){
				this.target = [];
				if(this.data.rows.length > 0){
					for(var i = 0; i < this.data.rows.length; i++){
						this.addRow(this.data.rows[i], i);
					}
				}else{
					$(this.opts.panel).prepend('<span class="no-result">查询结果为空。</span>');
				}
				if(this.opts.pagination){
					this.refreshPagination();
				}

				if(typeof this.opts.onLoad === 'function'){
					this.opts.onLoad.call(this);
				}
			}else{

			}

		},
		addRow : function(data, index){
			var thisGrid = this;
			var tbody = $(this.opts.panel).find('tbody');
			var DOM = {title:null, line : []};

			if(thisTool.browser.ismobile && index > 0){
				$('<tr>').html($('<td>').attr("colspan",this.opts.columns.length).css({
					border : 0,
					height : '15px'
				})).appendTo(tbody);
			}

			var titleRow = $('<tr class="planTitle">').appendTo(tbody), lineRow = null;
			var row = '';
			row += '	<td colspan="'+this.opts.columns.length+'" class="title">';
			if(this.opts.checkbox){
				row += '<span><input type="'+(this.opts.multiple?'checkbox':'radio')+'" index="'+index+'" value="'+data[this.opts.idField]+'" name="selectedItem" class="selectedItem"/></span>';
			}
			if(this.opts.titleFormatter){
				row += this.opts.titleFormatter.call(this, data, index);
			}else{
				row += '<span>'+data.title+'</span>';
			}
			if(this.opts.operationFormatter && !thisTool.browser.ismobile){
				row += this.opts.operationFormatter.call(this, data, index);
			}
			row += '	</td>';
			titleRow.html(row);

			DOM.title = titleRow;

			if(data[this.opts.childrenField]){
				for(var i = 0; i < data[this.opts.childrenField].length; i++){
					var obj = data[this.opts.childrenField][i];
					lineRow = $('<tr class="details">').appendTo(tbody);
					row = '';
					for(var j = 0; j < this.opts.columns.length; j++){
						row += '<td class="'+(this.opts.columns[j].className || '')+'" style="'+(this.opts.columns[j].width ? ('width:'+this.opts.columns[j].width) : '')+'"  >';
						if(this.opts.columns[j].formatter){
							row += this.opts.columns[j].formatter.call(this, obj[this.opts.columns[j].code], obj, data, i, index);//(当前值，行数据，完成主表数据，行序号，主表数据序号)
						}else{
							row += obj[this.opts.columns[j].code];
						}
						row += '</td>';
					}
					lineRow.html(row);

					DOM.line.push(lineRow);
				}
			}
			this.target.push(DOM);

			if(this.opts.operationFormatter && thisTool.browser.ismobile){
				var buttonRow = $('<tr class="buttonRow">').appendTo(tbody);
				row = '<td colspan="'+this.opts.columns.length+'">';
				row += this.opts.operationFormatter.call(this, data, index);
				row += '</td>';
				buttonRow.html(row);
			}

			if(typeof this.opts.onLoadRow === 'function'){
				this.opts.onLoadRow.call(this, data, index);
			}
			if(this.opts.onCheck){
				titleRow.find('.selectedItem').bind('change', function(){
					thisGrid.opts.onCheck.call(thisGrid, data, index, this);
				});
			}
		},
		getChecked : function(){
			var selectedItem = $(this.opts.panel).find('.selectedItem:checked');
			var returnData = [];
			var thisGrid = this;

			for(var i = 0; i < this.data.rows.length;i++){
				if(thisTool.objInArray(this.data.rows[i], selectedItem, function(v, o){
						return v[thisGrid.opts.idField] === o.value;
					})){
					returnData.push(this.data.rows[i]);
				}
			}

			return returnData;
		},
		checkedAll : function(){
			$(this.opts.panel).find('.selectedItem').each(function(){
				this.checked = true;
			}).change();
		},
		getDataByIndex : function(index){
			return this.data.rows[index];
		},
		refreshPagination:function(){
			var thisGrid = this;
			var pagination = '';
			var totalPage = Math.ceil(this.data.total / this.opts.pageSize);
			var buttonNum1 = 5, buttonNum2 = 3;

			pagination += '<ul class="pagination '+(thisTool.browser.ismobile?'pagination-sm':'')+'">';
			pagination += '	<li class="'+(this.opts.pageNum<=1?'disabled':'')+'"><a class="'+(this.opts.pageNum>1?'changePage':'')+'" targetPage="'+(this.opts.pageNum-1)+'" href="javascript:void(0)" aria-label="Previous"> <span';
			pagination += '			aria-hidden="true">&laquo;</span>';
			pagination += '	</a></li>';
			if(totalPage > 5){
				if(this.opts.pageNum > 3){
					pagination += '	<li class=""><a class="changePage" href="javascript:void(0)" targetPage="'+1+'">'+1+'</a></li>';
					pagination += '	<li class=""><a class="changePage" href="javascript:void(0)" targetPage="'+(this.opts.pageNum-3)+'">...</a></li>';
				}
			}
			var startCount = this.opts.pageNum - 3;
			if(this.opts.pageNum < 3){
				startCount = 0;
			}else if(totalPage > 5 && this.opts.pageNum > totalPage - 3){
				startCount = totalPage - 5;
			}
			for(var i = 0; i < Math.min(totalPage, 5); i++){
				pagination += '	<li class="'+(startCount+i+1 == this.opts.pageNum ? 'active' : '')+'"><a class="changePage" href="javascript:void(0)" targetPage="'+(startCount+i+1)+'">'+(startCount+i+1)+'</a></li>';
			}
			if(totalPage > 5){
				if(this.opts.pageNum < totalPage-2){
					pagination += '	<li class=""><a class="changePage" href="javascript:void(0)" targetPage="'+(this.opts.pageNum-0+3)+'">...</a></li>';
					pagination += '	<li class=""><a class="changePage" href="javascript:void(0)" targetPage="'+totalPage+'">'+totalPage+'</a></li>';
				}
			}
			pagination += '	<li class="'+(this.opts.pageNum>=totalPage?'disabled':'')+'"><a class="'+(this.opts.pageNum<totalPage?'changePage':'')+'" targetPage="'+(this.opts.pageNum-0+1)+'" href="javascript:void(0)" aria-label="Next"> <span';
			pagination += '			aria-hidden="true">&raquo;</span>';
			pagination += '	</a></li>';
			pagination += '</ul>';

			$(this.opts.panel).find('nav').html(pagination);
			$(this.opts.panel).find('.changePage').bind('click', function(){
				thisGrid.opts.pageNum = $(this).attr('targetPage');
				thisGrid.opts.pageElements=((thisGrid.opts.pageNum-1)*thisGrid.opts.pageSize);
				thisGrid.load();
			})
		}
	};

	thisTool.GRID = GRID;
	window.GRID = GRID;
})(jQuery);