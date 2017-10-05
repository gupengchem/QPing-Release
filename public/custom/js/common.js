$(function () {
    $('.dol-hideModal').click(function () {
        $(this).closest('.modal').modal('hide');
    });

    //修改密码
    let updatePwdForm = $('#update-password-form');
    let updatePwdModal = new Dolphin.modalWin({
        content : updatePwdForm,
        title : "修改信息",
        defaultHidden : true,
        footer : $('#update_password_form_footer'),
        hidden : function () {
            Dolphin.form.empty(updatePwdForm);
        }
    });
    $('#update_password_form_save').click(function () {
        if(Dolphin.form.validate(updatePwdForm)){
            let data = Dolphin.form.getValue(updatePwdForm);
            Dolphin.ajax({
                url : '/system/auth/user/changePwd',
                type : Dolphin.requestMethod.POST,
                data : Dolphin.json2string(data),
                onSuccess : function (reData) {
                    Dolphin.alert(reData.message, {
                        callback : function () {
                            updatePwdModal.modal('hide');
                        }
                    })
                }
            })
        }
    });
    window.updatePwdModal = updatePwdModal;
});

function parseCheckbox(name, checked){
    var div = $('<div class="slideThree">');
    var id = Dolphin.random(8);
    var input = $('<input type="checkbox">').attr({
        id : id,
        name : name
    }).appendTo(div);
    Dolphin.toggleCheck(input, checked);
    var label = $('<label>').attr('for', id).appendTo(div);
    return div;
}

function escape2Html(str) {
    var arrEntities={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"', 'amp;quot':'"'};
    return str.replace(/&(lt|gt|nbsp|amp;quot|quot|amp);/ig,function(all,t){return arrEntities[t];});
}

function bindSearchPanel(inputPanel, callback) {
    inputPanel.find('.searchInput').keypress(function (event) {
        if(event.keyCode == 13){
            callback();
        }
        event.stopPropagation();
        return false;
    });
    inputPanel.find('.searchButton').click(function () {
        callback();
        event.stopPropagation();
        return false;
    })
}


function getFileSize(num, unit) {
    unit = unit || 'B';
    let units = ['B', 'K', 'M', 'G'];

    let i = units.findIndex(function (u) {
        return u === unit;
    });
    for(;i < units.length && num > 1024; i++){
        num = num / 1024;
    }

    return num.toFixed(2) + units[i];
}