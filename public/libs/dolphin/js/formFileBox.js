(function($){
    var thisTool = Dolphin;
    function FILE_BOX(thisPanel, param){
        this.init(thisPanel, param);
        return this;
    }
    FILE_BOX.defaults = {
        //required
        name : null,
        uploadName : 'upfile',

        //options
        url : '/ecm/services/image/',
        getUrl : {
            url : '/ecm/services/image/detail',
            type : 'get'
        },
        title : null,

        //icon
        icon : {
            fileUpload : "glyphicon glyphicon-globe"
        }
    };

    FILE_BOX.prototype = {
        /* ==================== property ================= */
        constructor : FILE_BOX,
        panel : null,
        completeTitle : null,
        progressPanel : null,
        filesPanel : null,
        name : null,
        fileInput : null,
        fileId : null,

        /* ===================== method ================== */
        init : function(thisPanel, param){
            this.panel = thisPanel;
            this.files = [];
            this.opts = $.extend({}, FILE_BOX.defaults, param);
            this.fileInput = this.panel.find('input[type="file"]');
            this.name = this.opts.name || this.fileInput.attr('name');
            this.fileInput.attr('name', this.opts.uploadName);
            this.fileId = $('<input type="hidden" />').attr('name', this.name).appendTo(this.panel);
            this.render();
            this.bind();
            return this;
        },

        render : function () {
            this.completeTitle = $('<div class="upload_complete">').html('<span class="label label-default">上传成功</span>').appendTo(this.panel);
            this.progressPanel = $('<div class="progress">').append('<div class="progress-bar">').appendTo(this.panel);
            this.filesPanel = $('<div class="dolphin_files">').appendTo(this.panel);
        },

        bind : function () {
            var _this = this,
                fileParam;

            fileParam = $.extend({}, {
                /*submit : function (e, data) {
                    debugger;
                },
                send : function (e, data) {
                    debugger;
                },*/
                progressall : function (e, data) {
                    _this.progressAll.call(_this, e, data);
                },
                done : function (e, data) {
                    _this.complete.call(_this, e, data);
                }
            }, _this.opts);

            _this.panel.find('input[type="file"]').fileupload(fileParam);
        },

        progress : function (e, data) {
            debugger;
        },

        progressAll : function (e, data) {
            this.completeTitle.hide();
            var progress = parseInt(data.loaded / data.total * 100, 10) + "%";
            this.progressPanel.show().find('.progress-bar').css('width' , progress);
        },

        complete : function (e, data) {
            var _this = this, result = typeof data.result=== 'string'?thisTool.string2json(data.result):data.result;
            _this.progressPanel.hide();
            if(result.success){
                _this.completeTitle.fadeIn(500);
                setTimeout(function () {
                    _this.completeTitle.fadeOut(500);
                }, 3000);
                this.addFile(result);
            }else{
                Dolphin.alert(result[thisTool.defaults.ajax.returnMsgKey] || '上传失败', {
                    countDownFlag : false
                });
            }
        },
        addFiles : function (data) {
            var i, ol, li;
            ol = this.filesPanel.find('ol');
            if(ol.length == 0){
                ol = $('<ol>').appendTo(this.filesPanel);
            }
            for(i = 0; i < data.result.length; i++){
                li = this.addFile(data.result[i]).appendTo(ol);
            }

            return this;
        },

        addFile : function (data) {
            var _this = this,
                file, remove, fileId,
                ol, li;

            //DOM
            ol = this.filesPanel.find('ol');
            if(ol.length == 0){
                ol = $('<ol>').appendTo(this.filesPanel);
            }
            file = $('<li>').attr({
                'data-id' : data.id
            }).html(data.fileName);
            remove = $('<span class="glyphicon glyphicon-remove">').appendTo(file);
            remove.click(function () {
                _this.removeFile(data.id);
            });
            file.appendTo(ol);

            //data
            fileId = _this.fileId.val();
            if(fileId.length > 0){
                fileId += ","
            }
            fileId += data.id;
            _this.fileId.val(fileId);
            this.files.push(data);

            return this;
        },

        removeFile : function (id) {
            var _this = this,
                i, fileIds;
            for(i = 0; i < _this.files.length; i++){
                if(_this.files[i].id == id){
                    _this.files.splice(i, 1);
                    break;
                }
            }

            fileIds = _this.fileId.val().split(',');
            for(i = 0; i < fileIds.length; i++){
                if(fileIds[i] == id){
                    fileIds.splice(i, 1);
                    break;
                }
            }
            _this.fileId.val(fileIds.join(","));

            _this.panel.find('li[data-id="'+id+'"]').remove();
        },

        //method
        resetFiles : function () {
            var _this = this,
                fileIds;
            fileIds = _this.fileId.val();
            this.filesPanel.empty();
            if(fileIds){
                thisTool.ajax({
                    url : _this.opts.getUrl.url,
                    type : _this.opts.getUrl.type,
                    forceUrl : true,
                    data : {ids : fileIds},
                    onSuccess : function (reData) {
                        _this.addFiles(reData.rows);
                    }
                });
            }
        }
    };

    $.fn.fileBox = function (param) {
        var thisControl, thisFunc;
        if(typeof param == 'string'){
            thisControl = this.eq(0).data('dolphin');
            if(thisControl){
                thisFunc = this.eq(0).data('dolphin')[param];
                if(typeof thisFunc === 'function'){
                    return thisFunc.apply(thisControl, arguments.slice(1));
                }
            }
            console.log('FILE_BOX has no such function : '+ param);
            return false;
        }else{
            this.each(function () {
                if($(this).data('dolphin')){
                    thisControl = $(this).data('dolphin');
                    return false;
                }else{
                    $(this).data('dolphin', new FILE_BOX($(this), param));
                }
            });
            return thisControl;
        }
    };

    thisTool.FILE_BOX = FILE_BOX;

})(jQuery);