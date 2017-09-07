/**
 * Created by wangshuyi on 2017/8/31.
 */

'use strict';

const ProductService = require('../../service/salesUtil/ProductService');

ProductService.find({tenant:"33f0fe38-fcd1-4f11-8a55-1831821b38c5"}, {}).then(productList => {
    let i = 0;
    let setSearchName = () => {
        ProductService.updateById({tenant:"33f0fe38-fcd1-4f11-8a55-1831821b38c5"}, productList[i], {
            searchName : productList[i].name.replace(/ /g, '').substr(0, 15)
        }).then(result => {
            i++;
            if(i < productList.length){
                setSearchName();
            }else{
                console.log('///////////////////////////////////');
                console.log('/////////////It\'s over/////////////');
                console.log('///////////////////////////////////');
            }
        });
    };
    setSearchName();
});