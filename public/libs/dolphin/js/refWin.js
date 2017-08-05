(function($){
	var thisTool = Dolphin;
	function REFWIN(param){
		this.init(param);
	}
	REFWIN.defaults = {
		id:"myModal",
		className : "",
		title : "参照选择",
		url : null,
		data : null,
		idField : 'code',
		textField : 'name',

		modalSize : '',

		queryParams : null,
		queryCondition : null,
		ajax : thisTool.ajax,

		type : 'tree',
		multiple:false,
		//tree
		cascadeCheck:true,
		onlyLeafCheck:false,
		//list
		columns : [],
		striped : true,
		bordered : true,
		rowIndex : true,
		width : null,
		pagination:true,
		pageSize:5,
		pageNum:1,

		onload : function(){},
		onSubmit : null,
		onShow : null,

		mockPathData : null,
		showButton : null
	};

	REFWIN.prototype = {
		/* ==================== property ================= */
		constructor : REFWIN,
		data : null,
		win : null,
		refObj : null,
		queryform : null,

		/* ===================== method ================== */
		init : function(param){
			var _this = this;
			this.opts = $.extend({}, REFWIN.defaults, param);

			this.render();

			if(this.opts.type == 'tree'){
				this.refObj = new thisTool.TREE($.extend({panel:this.win.find('.ref-obj-panel')}, this.defaults, param));
			}else if(this.opts.type == 'list'){
				this.refObj = new thisTool.LIST($.extend({panel:this.win.find('.ref-obj-panel')}, this.defaults, param));
			}

			if(this.opts.queryCondition){
			}

			this.bind();

			if(this.opts.showButton){
				$(this.opts.showButton).click(function () {
					_this.show();
				})
			}
		},
		empty : function(){
			$(this.opts.panel).empty();
		},
		render : function(){
			var modalWin = $('<div class="modal fade '+this.opts.className+'" id="'+this.opts.id+'" tabindex="-1" role="dialog" aria-labelledby="'+this.opts.id+'Label" aria-hidden="true">');
			var html = '';
			html += '<div class="modal-dialog '+this.opts.modalSize+'">';
			html += '	<div class="modal-content">';
			html += '		<div class="modal-header">';
			html += '			<button type="button" class="close" data-dismiss="modal"';
			html += '				aria-label="Close">';
			html += '				<span aria-hidden="true">&times;</span>';
			html += '			</button>';
			html += '			<h4 class="modal-title" id="'+this.opts.id+'Label">';
			html += this.opts.title;
			if(this.opts.queryCondition){
				html += ' <div class="ref-condition"><form class="refQueryForm">';
				html += '<div class="input-group input-group-sm">';
				html += '    <input type="text" class="form-control" name="'+this.opts.queryCondition.attr[0].code+'" placeholder="根据'+this.opts.queryCondition.attr[0].title+'查询..." dol-validate="minLength[2]" >';
				html += '    <span class="input-group-btn">';
				html += '        <button class="btn btn-default" type="button"><span class="glyphicon glyphicon-search" aria-hidden="true"></span>&nbsp;</button>';
				html += '    </span>';
				html += '</div><!-- /input-group -->';
				html += '</form></div>';
			}
			html += '</h4>';
			html += '		</div>';
			html += '		<div class="modal-body">';
			html += '			<div class="ref-query-condition-panel"></div>';
			html += '			<div class="ref-obj-panel"></div>';
			html += '		</div>';
			html += '		<div class="modal-footer">';
			html += '			<button type="button" class="btn btn-primary submitButton">确定</button>';
			html += '			<button type="button" class="btn btn-default" data-dismiss="modal">取消</button>';
			html += '		</div>';
			html += '	</div>';
			html += '</div>';

			this.win = modalWin;

			modalWin.html(html).appendTo('body');
		},
		renderCondition : function(){
			var condition_panel = this.win.find('.ref-query-condition-panel');
			this.queryform = new thisTool.FORM({
				panel : condition_panel
			});
			this.queryform.renderForm(this.opts.queryCondition);
			return this;
		},
		bind : function(){
			var thisRefWin = this;
			$(this.win).find('.submitButton').bind('click', function(){
				thisRefWin.submit();
			});
			if(this.opts.queryCondition){
				var queryForm = this.win.find('.refQueryForm');
				thisRefWin.queryform = new thisTool.FORM({
					panel : queryForm
				});
				function query(){
					if(thisRefWin.queryform.validate()){
						thisRefWin.refObj.query(thisTool.form2json(queryForm));
					}
				}

				queryForm.find('input').bind('click', function(e){
					if(e.keyCode == 13){
						query();
					}
				}).next().children('button').bind('click', function(){
					query();
				})
			}
		},
		find : function(){

		},
		findById : function(){

		},
		findByText : function(){

		},
		show : function(){
			if(typeof this.opts.onShow === 'function'){
				this.opts.onShow.call(this);
			}
			this.win.modal('show');
		},
		submit : function(){
			if(typeof this.opts.onSubmit === 'function'){
				var returnData = this.refObj.getChecked();
				if(returnData && returnData.length > 0){
					this.opts.onSubmit.call(this, returnData);
					this.win.modal('hide');
				}else{
					thisTool.alert('请至少选择一条数据。')
				}
			}else{
				this.win.modal('hide');
			}
		}
	};

	thisTool.REFWIN = REFWIN;
})(jQuery);