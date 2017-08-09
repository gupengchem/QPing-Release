Dolphin.systemConfig = {
    pageScript : "/page-script"
};
Dolphin.defaults.mockFlag = true;
Dolphin.path.contextPath = "";
Dolphin.path.publicPath = "";
Dolphin.path.uploadPath = Dolphin.path.publicPath + "/uploadFiles";
Dolphin.defaults.url.viewPrefix = "/view";
Dolphin.defaults.ajax.requestHeader = $.extend(Dolphin.defaults.ajax.requestHeader, {
    "ajax-flag" : true
});
Dolphin.defaults.ajax.returnMsgKey = "message";
// Dolphin.defaults.modalWin.defaultHidden = true;
Dolphin.LIST.defaults.ajaxType = "post";
Dolphin.LIST.defaults.idField = "_id";
Dolphin.FORM.defaults.select.nameField = "text";
Dolphin.enum.setOptions({
    ajaxFlag :  true,
    enumUrl : `${Dolphin.path.contextPath}/system/dict/options/{id}`,
    cookieFlag : false,
    textField : 'text'
});

Dolphin.enum.addEnum("checkArea", [
    {code: '10', name: '外场'},
    {code: '20', name: '厨房'}
]);

Dolphin.enum.addEnum("temperature", [
    {code: '10', name: '常温'},
    {code: '20', name: '冷冻'},
    {code: '30', name: '冷藏'},
    {code: '40', name: '干货'}
]);

Dolphin.enum.addEnum("shelfUnit", [
    {code: '10', name: '天'},
    {code: '20', name: '周'},
    {code: '30', name: '月'},
    {code: '40', name: '年'}
]);

Dolphin.enum.addEnum("standardUnit", [
    {code: '10', name: 'EA'},
    {code: '20', name: 'KG'},
    {code: '40', name: 'G'}
]);

Dolphin.enum.addEnum("measureUnit", [
    {code: '10', name: 'BAG'},
    {code: '20', name: 'BOX'}
]);

Dolphin.enum.addEnum("supplierType", [
    {code: 'FLVN01', name: '采购组织'},
    {code: 'FLVN00', name: '公司代码'}
]);

Dolphin.enum.addEnum('Bugroup', [
    {code: 'ZN01', name: '关联客户'},
    {code: 'ZN02', name: '工厂'},
    {code: 'ZW01',name: '外部客户'},
    {code: 'ZW02', name: '财务客户'},
    {code: 'ZY01', name: '员工'}
]);

Dolphin.enum.addEnum('purchaseType', [
    {code: '10', name: '外部采购'},
    {code: '20', name: '内部调拨'},
    {code: '30', name: '退货订单'}
]);

Dolphin.enum.addEnum('orderLineType', [
    {code: '10', name: '正常'},
    {code: '20', name: '退菜'},
    {code: '60', name: '培训'},
    {code: '70', name: '赠菜'},
    {code: '30', name: '报损'}
]);

Dolphin.enum.addEnum('posPeriod', [
    {code: '10', name: '早市'},
    {code: '20', name: '午市'},
    {code: '30', name: '下午茶'},
    {code: '40', name: '晚市'},
    {code: '50', name: '未知'}
]);
Dolphin.enum.addEnum('brandName', [
    {code: '4', name: 'Marzano'}
]);

Dolphin.enum.addEnum('saleMethod', [
    {code: '00', name: '通用'},
    {code: '10', name: '堂食'},
    {code: '11', name: 'PMP'},
    {code: '12', name: '外卖'},
    {code: '13', name: '外带'},
    {code: '14', name: 'Catering'},
    {code: '15', name: '加盟'},
    {code: '16', name: '批发'},
    {code: '17', name: '收定金'},
    {code: '18', name: '试吃'},
    {code: '19', name: '员工餐'},
    {code: '20', name: '电商'},
    {code: '90', name: '公司间交易'}
]);

