/**
 * Created by wangshuyi on 2016/12/30.
 */

'use strict';
const tool = require('./tool');
const util = {};

util.formatCondition = function(condition){
    let key;
    delete condition._;
    for(key in condition){
        if(condition[key] == "" || condition[key] == null){
            delete condition[key];
        }else if(condition[key] == "-"){
            condition[key] = "";
        }else if(/_like$/.test(key)){
            condition[key.replace(/_like$/, '')] = {'$regex': condition[key]};
            delete condition[key];
        }else if(/_dateTime_start$/.test(key)){
            if(condition[key.replace(/_dateTime_start$/, '')]){
                condition[key.replace(/_dateTime_start$/, '')]['$gte'] = tool.string2date(condition[key], 'yyyy-MM-dd hh:mm')
            }else{
                condition[key.replace(/_dateTime_start$/, '')] = {'$gte': tool.string2date(condition[key], 'yyyy-MM-dd hh:mm')};
            }
            delete condition[key];
        }else if(/_dateTime_end$/.test(key)){
            if(condition[key.replace(/_dateTime_end$/, '')]){
                condition[key.replace(/_dateTime_end$/, '')]['$lte'] = tool.string2date(condition[key], 'yyyy-MM-dd hh:mm')
            }else{
                condition[key.replace(/_dateTime_end$/, '')] = {'$lte': tool.string2date(condition[key], 'yyyy-MM-dd hh:mm')};
            }
            delete condition[key];
        }else if(/_date_start$/.test(key)){
            if(condition[key.replace(/_date_start$/, '')]){
                condition[key.replace(/_date_start$/, '')]['$gte'] = tool.string2date(condition[key], 'yyyy-MM-dd')
            }else{
                condition[key.replace(/_date_start$/, '')] = {'$gte': tool.string2date(condition[key], 'yyyy-MM-dd')};
            }
            delete condition[key];
        }else if(/_date_end$/.test(key)){
            if(condition[key.replace(/_date_end$/, '')]){
                condition[key.replace(/_date_end$/, '')]['$lte'] = tool.string2date(condition[key], 'yyyy-MM-dd')
            }else{
                condition[key.replace(/_date_end$/, '')] = {'$lte': tool.string2date(condition[key], 'yyyy-MM-dd')};
            }
            delete condition[key];
        }else if(/_notEquil$/.test(key)){
            condition[key.replace(/_notEquil$/, '')] = {'$ne': condition[key]};
            delete condition[key];
        }

    }
    return condition;
};
util.formatData = function(data){
    let key;
    for(key in data){
        if(/_array$/.test(key)){
            data[key.replace(/_array$/, '')] = data[key] || [];
            delete data[key];
        }else if(/_date$/.test(key)){
            data[key.replace(/_date$/, '')] = data[key]?tool.string2date(data[key] + ' 00:00:00', 'yyyy-MM-dd hh:mm:ss'):'';
            delete data[key];
        }else if(/_datetime$/.test(key)){
            data[key.replace(/_datetime$/, '')] = data[key]?tool.string2date(data[key] + ':00', 'yyyy-MM-dd hh:mm:ss'):'';
            delete data[key];
        }
    }
    return condition;
};


module.exports = util;