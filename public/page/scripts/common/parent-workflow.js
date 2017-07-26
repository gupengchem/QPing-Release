function graphTrace(options, pid, pdid, panelId) {



    var _defaults = {
        srcEle: null,
        pid: pid,
        pdid: pdid
    };
    var opts = $.extend(true, _defaults, options);
    var groupOffset = {
        apply_form: {left: 100, top: 0, percent: 0.93, offset: 0},
        promotion_apply: {left: -82, top: -62}
    };

    // 获取图片资源
    var imageUrl = "/api/e06adc498e25467fb10fdb89892c0877@procsInsId=" + opts.pid+"?__image__=1";     //TODO 获取图片路径
    Dolphin.ajax({
        url: '/api/f272132397c943098642dc11769c9f07@processInstanceId=' + opts.pid,
        type: Dolphin.requestMethod.GET,
        onSuccess: function (infos) {
            var positionHtml = "";
            var workflowTraceDialog = null;
            if ($('#workflowTraceDialog').length == 0) {
                workflowTraceDialog = $('<div/>', {
                    id: 'workflowTraceDialog',
                    html: "<div><img src='" + imageUrl + "' style='position: absolute;max-height: 420px;' onload='workflowTraceResetHeight(this,\"" + panelId + "\")' />" +
                    "<div id='processImageBorder'>" +
                    //positionHtml +
                    "</div>" +
                    "</div>"
                }).appendTo('#' + panelId);
            } else {
                $('#workflowTraceDialog img').attr('src', imageUrl);
                $('#workflowTraceDialog #processImageBorder').html(positionHtml);
            }
            // 生成图片
            var workflowTraceBodrder = workflowTraceDialog.find("#processImageBorder");
            var varsArray = new Array();
            $.each(infos, function (i, v) {
                if (v) {
                    var $positionDiv = $('<div/>', {
                        'class': 'activity-attr'
                    }).css({
                        position: 'absolute',
                        left: (v.x + (groupOffset[pdid.split(":")[0]] ? groupOffset[pdid.split(":")[0]].left : 0)),
                        top: (v.y + (groupOffset[pdid.split(":")[0]] ? groupOffset[pdid.split(":")[0]].top : 0)),
                        width: (v.width - 2),
                        height: (v.height - 2),
                        backgroundColor: 'black',
                        opacity: 0,
                        zIndex: 800
                    });

                    // 节点边框
                    var $border = $('<div/>', {
                        'class': 'activity-attr-border'
                    }).css({
                        position: 'absolute',
                        left: (v.x + (groupOffset[pdid.split(":")[0]] ? groupOffset[pdid.split(":")[0]].left : -34)),
                        top: (v.y + (groupOffset[pdid.split(":")[0]] ? groupOffset[pdid.split(":")[0]].top : -33)),
                        width: (v.width - 4),
                        height: (v.height - 3),
                        zIndex: 799
                    });

                    // 子流程点击事件
                    if (v.subProSize && v.subProSize > 0) {
                        $positionDiv.css('cursor', 'pointer');
                        $positionDiv.attr('onclick', 'showSubPro(' + v.processInstanceId + ', "' + panelId + '", "' + pdid.split(":")[0] + '")');
                    }
                    workflowTraceBodrder.append($positionDiv).append($border);
                    //positionHtml += $positionDiv.outerHTML() + $border.outerHTML();
                    varsArray[varsArray.length] = v.vars;
                }
            });
            // 设置每个节点的data
            $('#workflowTraceDialog .activity-attr').each(function (i, v) {
                $(this).data('vars', varsArray[i]);
            });
            $('#workflowTraceDialog').css('padding', '0.2em');
            $('#workflowTraceDialog .ui-accordion-content').css('padding', '0.2em').height($('#workflowTraceDialog').height() - 75);
        }
    });
}

function showSubPro(processInstanceId, parentId, prcsName) {
    var url = REQUEST_MAP.contextPath + '/content/workflow/subTaskInfo.jsp?processInstanceId=' + processInstanceId + '&parentId=' + parentId;
    //if(prcsName == 'prcs_register'){
    if (true) {
        url += "&buttonFlag=true";
    }
    var subProId = processInstanceId + "sub";
    //if(prcsName == 'prcs_register'){
    if (true) {
        if ($("#" + subProId).length == 0) {
            var subPro = $('<div id="' + subProId + '">').css({
                display: "none",
                position: "relative"
            }).addClass("content").load(url);
            $("#" + parentId).after(subPro);
        } else {
            //$("#"+subProId).load(url);
        }

        $("#" + parentId).hide();
        $("#" + subProId).show();
    } else {
        if ($("#" + subProId).length == 0) {
            $('<div id="' + subProId + '" class="modal hide fade" >').css({
                width: "900px",
                height: "500px",
                marginLeft: "-450px"
            }).load(url).modal();
        } else {
            $("#" + subProId).load(url).modal();
        }
    }
}

function workflowTraceResetHeight(thisObj, panelId) {
    $("#" + panelId).height(thisObj.height || 300);
}
