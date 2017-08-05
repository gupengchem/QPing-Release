$(function () {
    if ($('#fileupload').length)
        $('#fileupload').fileupload({
            url: (org.breezee.context.contextPath == '/' ? '' : org.breezee.context.contextPath) + '/file/',
            dataType: 'json',
            done: function (e, data) {
                $("#imageValue").val(data);
                console.log(data, '-----------------------------');
            },
            progressall: function (e, data) {
            }
        });

    if ($('#daterange').length)
        $('#daterange').daterangepicker();

    if ($('.date-picker').length)
        $('.date-picker').datepicker();
});