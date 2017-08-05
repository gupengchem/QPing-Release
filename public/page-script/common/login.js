/**
 * Created by Shubert.Wang on 2016/1/22.
 */

$(function () {
    $('#loginForm').bind("submit", function () {
        var data = Dolphin.form.getValue('loginForm');
        $.ajax({
            url : contextData.contextPath+'/login',
            type : 'post',
            data : data,
            success : function (data) {
                if(data.success){
                    location.href = Dolphin.path.contextPath + $('#redirectUrl').val();
                }else{
                    alert(data.message);
                }
            }
        });
        return false;
    });
});