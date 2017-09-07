/**
 * Created by wangshuyi on 2017/8/30.
 */

'use strict';

const pdfReader = require('./module/util/pdfReader');
const SalesService = require('./service/salesUtil/SalesService');
const BuyerService = require('./service/salesUtil/BuyerService');
const ProductService = require('./service/salesUtil/ProductService');
const tool = require('./module/util/tool');
const fs = require('fs');
const tenant = "33f0fe38-fcd1-4f11-8a55-1831821b38c5";

pdfReader.loadWebPdf('./OrderFileFolder/new/webPdf/Shine Liang222.pdf').then(data => {
    console.log(data);

});