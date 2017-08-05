/**
 * Created by wangshuyi on 2017/8/4.
 */

'use strict';
Dolphin.validate.method.sameInput = {
    validator : function(selector, otherInputSelector, otherLabel){
        if(selector.val() && $(otherInputSelector).val() != selector.val()){
            return false;
        }else{
            return true;
        }
    },
    message : function(label, selector, otherInputSelector, otherLabel){
        return label + "与" + otherLabel + '输入不一致';
    }
};