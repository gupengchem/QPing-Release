$(function () {
    $('.fileupload').fileupload({
        url: org.breezee.context.contextPath + '/rsaFile',
        dataType: 'json',
        done: function (e, data) {
            let p = $(e.target).closest('.rsa-div');
            console.log(data.result);
            p.find('.form-control').val(data.result.name);
        },
        progressall: function (e, data) {
        }
    });
});