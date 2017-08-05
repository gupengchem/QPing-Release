/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved. 
 */

$(function () {
    $("#login_btn").click(function () {
        var data = Dolphin.form.getValue('form');
        var redirectUrl = $(this).data('redirect') || '/index';
        Dolphin.ajax({
            url: '/api/login',
            type: Dolphin.requestMethod.POST,
            data: Dolphin.json2string(data),
            success: function (reData, textStatus) {
                if(!reData.success){
                    $('.error-mess').css('display','block');
                    $('#error-message').html(reData.msg || '服务出错，请联系管理员');
                }else{
                    $('.error-mess').css('display','none');
                    Dolphin.goUrl(redirectUrl);
                }
                $('#submit').attr("disabled", false);
                $('#submit').val("登录");
            },
            onError: function () {
                $('#submit').attr("disabled", false);
                $('#submit').val("登录");
            },
            onComplete:function () {
                Dolphin.goUrl(redirectUrl);
            }
        });
        $('#submit').attr("disabled", true);
        $('#submit').val("正在登录...");
    });
});