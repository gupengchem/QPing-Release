/**
 * Created by wangshuyi on 2016/12/28.
 */

'use strict';

const Menu = {
    nav : $('.navbar')
};

Menu.select = function (code) {
    this.nav.find("[menuCode='"+code+"']").addClass('active').closest('.dropdown').addClass('active');
};