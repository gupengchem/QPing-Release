(function($){
	var thisTool = Dolphin;
	function PAGINATION(param){
		this.init(param);

		return this;
	}
	PAGINATION.defaults = {
		panel : "",								        //生成区别，遵循jQuery选择器规则
		pageSize : 10,										//每页条数
		pageNumber : 1,									//当前页码

		pageSizeOption : [5, 10, 20, 50],					//每页条数可选项
		indexStart : 1,									//页码起始号
		simpleFlag : false,                              //简化分页条

		type : "page",										//分页展现类型 page, more

		onChangePageSize : null,							//事件
		onChangePageNumber : null,
		onChange : null
	};



	PAGINATION.prototype = {
		/* ==================== property ================= */
		constructor : PAGINATION,
		data : null,
		morePanel : null,

		/* ===================== method ================== */
		init : function(param){
			this.opts = $.extend({}, PAGINATION.defaults, param);

			this.render();

			return this;
		},
		initData : function (data) {
			this.data = data;
			$.extend(this.opts, data);

			return this;
		},

		render : function(){
			switch (this.opts.type){
				case "more":
					this.renderMore();
					break;
				default:
					this.renderPage();
			}

			return this;
		},

		renderPage : function(){
			var _this = this,i;
			var footer = $('<div class="listFooter">').appendTo(_this.opts.panel);
			var pageInfo = $('<span class="pageInfo">').appendTo(footer);
			if(_this.opts.simpleFlag){
				pageInfo.append("每页");
			}else{
				pageInfo.append("每页显示");
			}
			var pageSize = $('<select class="_pageSize">').appendTo(pageInfo);
			for(i = 0; i < _this.opts.pageSizeOption.length; i++){
				$('<option value="'+_this.opts.pageSizeOption[i]+'">').html(_this.opts.pageSizeOption[i]).appendTo(pageSize);
			}
			pageInfo.append("条");
			if(!_this.opts.simpleFlag){
				pageInfo.append("，当前显示第 ");
				$('<span class="pageInfoNum _infoStart">').html(0).appendTo(pageInfo);
				pageInfo.append(" 到 ");
				$('<span class="pageInfoNum _infoEnd">').html(0).appendTo(pageInfo);
				pageInfo.append(" 条");
			}
			pageInfo.append("，共 ");
			$('<span class="pageInfoNum _infoTotal">').html(0).appendTo(pageInfo);
			pageInfo.append(" 条记录。");

			$('<nav class="pagination">').addClass(_this.opts.paginationClass).appendTo(footer);

			//event
			pageSize.change(function () {
				_this.opts.pageSize = this.value;
				if(typeof _this.opts.onChangePageSize == "function"){
					_this.opts.onChangePageSize.call(_this);
				}
				if(typeof _this.opts.onChange == "function"){
					_this.opts.onChange.call(_this);
				}
			});

			return this;
		},
		renderMore : function(){
			var _this = this;
			this.moreButton = $('<button type="button" class="btn btn-default btn-block default-hidden">点击加载更多</button>').click(function () {
				_this.opts.pageNumber++;
				if(typeof _this.opts.onChangePageNumber == "function"){
					_this.opts.onChangePageNumber.call(_this);
				}
				if(typeof _this.opts.onChange == "function"){
					_this.opts.onChange.call(_this);
				}
			}).appendTo(this.opts.panel);

			return this;
		},

		refresh : function () {
			switch (this.opts.type){
				case "more":
					this.refreshMore();
					break;
				default:
					this.refreshPage();
			}

			return this;
		},

		refreshPage : function () {
			var _this = this;
			if(!_this.data){
				_this.data={total:0};
			}
			//======== pagination
			var pagination = '',totalPage = Math.ceil(_this.data.total / _this.opts.pageSize);

			pagination += '<ul class="pagination">';
			pagination += '	<li class="'+(_this.opts.pageNumber<=1?'disabled':'')+'"><a class="'+(_this.opts.pageNumber>1?'changePage':'')+'" targetPage="'+(_this.opts.pageNumber-1)+'" href="javascript:void(0)" aria-label="Previous"> <span';
			pagination += '			aria-hidden="true">&laquo;</span>';
			pagination += '	</a></li>';
			if(totalPage > 5){
				if(this.opts.pageNumber > 3){
					pagination += '	<li class=""><a class="changePage" href="javascript:void(0)" targetPage="'+1+'">'+1+'</a></li>';
					pagination += '	<li class=""><a class="changePage" href="javascript:void(0)" targetPage="'+(_this.opts.pageNumber-3)+'">...</a></li>';
				}
			}
			var startCount = _this.opts.pageNumber - 3;
			if(_this.opts.pageNumber < 3 || totalPage <= 5){
				startCount = 0;
			}else if(totalPage > 5 && _this.opts.pageNumber > totalPage - 3){
				startCount = totalPage - 5;
			}
			for(var i = 0; i < Math.min(totalPage, 5); i++){
				pagination += '	<li class="'+(startCount+i+1 == _this.opts.pageNumber ? 'active' : '')+'"><a class="changePage" href="javascript:void(0)" targetPage="'+(startCount+i+1)+'">'+(startCount+i+1)+'</a></li>';
			}
			if(totalPage > 5){
				if(_this.opts.pageNumber < totalPage-2){
					pagination += '	<li class=""><a class="changePage" href="javascript:void(0)" targetPage="'+(_this.opts.pageNumber-0+3)+'">...</a></li>';
					pagination += '	<li class=""><a class="changePage" href="javascript:void(0)" targetPage="'+totalPage+'">'+totalPage+'</a></li>';
				}
			}
			pagination += '	<li class="'+(_this.opts.pageNumber>=totalPage?'disabled':'')+'"><a class="'+(_this.opts.pageNumber<totalPage?'changePage':'')+'" targetPage="'+(_this.opts.pageNumber-0+1)+'" href="javascript:void(0)" aria-label="Next"> <span';
			pagination += '			aria-hidden="true">&raquo;</span>';
			pagination += '	</a></li>';
			pagination += '</ul>';

			$(_this.opts.panel).find('nav').html(pagination);
			$(_this.opts.panel).find('.changePage').bind('click', function(){
				_this.opts.pageNumber = $(this).attr('targetPage');
				if(typeof _this.opts.onChangePageNumber == "function"){
					_this.opts.onChangePageNumber.call(_this);
				}
				if(typeof _this.opts.onChange == "function"){
					_this.opts.onChange.call(_this);
				}
			});

			//========= pageInfo
			$(_this.opts.panel).find('._pageSize').val(_this.opts.pageSize);
			$(_this.opts.panel).find('._infoStart').html(Math.min((_this.opts.pageSize * (_this.opts.pageNumber - 1) + 1), _this.data.total));
			$(_this.opts.panel).find('._infoEnd').html(Math.min((_this.opts.pageSize * _this.opts.pageNumber), _this.data.total));
			$(_this.opts.panel).find('._infoTotal').html(_this.data.total);

			return this;
		},
		refreshMore : function () {
			if(!this.data || this.opts.pageSize * this.opts.pageNumber > this.data.total){
				this.moreButton.hide();
			}else{
				this.moreButton.show();
			}
			return this;
		},
		empty : function(){
			this.data = {total:0};
			this.refresh();
		}
	};

	thisTool.PAGINATION = PAGINATION;
})(jQuery);