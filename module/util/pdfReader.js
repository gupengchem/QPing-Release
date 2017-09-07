/**
 * Created by wangshuyi on 2017/8/30.
 */

'use strict';
const PDFParser = require("pdf2json");

const pdfReader = {};

pdfReader.loadPdfFile = function(filePath){
    return new Promise((resolve, reject) => {
        let pdfParser = new PDFParser();

        pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", pdfData => resolve(pdfData));

        pdfParser.loadPDF(filePath);
    });
};

pdfReader.loadEmailPdf = function(filePath){
    return new Promise((resolve, reject) => {
        let orderId,
            result = {
                buyer:null,
                productName:null,
                orderId:null,
            };

        this.loadPdfFile(filePath).then(pdf => {
            pdf.formImage.Pages[0].Texts.forEach((text, i) => {
                if(/^From:$/.test(decodeURIComponent(text.R[0].T)) && !result.buyer){
                    result.buyer = decodeURIComponent(pdf.formImage.Pages[0].Texts[i+1].R[0].T);
                }
                if(/^Subject:$/.test(decodeURIComponent(text.R[0].T)) && !result.productName){
                    result.productName = decodeURIComponent(pdf.formImage.Pages[0].Texts[i+1].R[0].T);
                }
                if(/^Order $/.test(decodeURIComponent(text.R[0].T)) && !result.orderId){
                    orderId = decodeURIComponent(pdf.formImage.Pages[0].Texts[i+1].R[0].T);
                    if(/^#\d{3}-\d{7}-\d{7}$/.test(orderId)){
                        result.orderId = orderId.replace('#', '');
                    }
                }
            });

            result.buyer = result.buyer.replace(/ <.*>/,'');
            if(result.orderId){
                result.productName = result.productName.replace(/Fwd: Your Amazon.com order of (.*)"(.*)"./, '$2');
            }else{
                result.productName = result.productName.replace(/Fwd: Thank you for reviewing (.*) on Amazon/, '$1');
            }

            resolve(result);
        }, err => reject(err));
    });
};

pdfReader.loadWebPdf = function(filePath){
    return new Promise((resolve, reject) => {
        let str = '', i;
        let result = {
            buyer: null,
            orderId: null,
            productName: []
        };

        this.loadPdfFile(filePath).then(pdf => {
            pdf.formImage.Pages[0].Texts.forEach((text, i) => {
                let c = decodeURIComponent(text.R[0].T).trim();
                str += c;

                if(c.length != 1){
                    console.log(c, i);
                }
            });
            let orderId = str.match(/Amazon.comordernumber:(.*)OrderTotal/);
            for(i = 1; i < orderId.length; i++){
                if(/^\d{3}-\d{7}-\d{7}$/.test(orderId[i])){
                    result.orderId = orderId[i];
                    break;
                }
            }
            let start = 0;
            let from = 0;
            while(start >= 0){
                from = str.indexOf('1of:', start);
                if(from >= 0){
                    let to = str.indexOf('Soldby:', from);
                    result.productName.push(str.substring(from+4, to));
                    start = to;
                }else{
                    start = -1;
                }
            }

            resolve(result);
        }, err => reject(err));
    });
};

module.exports = pdfReader;