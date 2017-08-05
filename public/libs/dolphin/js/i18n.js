/**
 * Created by Shubert.Wang on 2015/11/10.
 */
(function ($) {
    Dolphin.messages = {};

    Dolphin.i18n = {};
    Dolphin.i18n.defaults = {
        defaultLang : navigator.language,
        url : '/data/i18n/{id}'
    };
    Dolphin.i18n.addMessages = function(list, lang){
        var language = lang || this.defaults.defaultLang;

        if(Dolphin.messages[language] == null){
            Dolphin.messages[language] = {};
        }

        $.extend(Dolphin.messages[language], list);
    };

    Dolphin.i18n.get = function(key){
        var language = this.defaults.defaultLang;
        var template = Dolphin.messages[language][key],
            i;

        if(template){
            for(i = 1; i < arguments.length; i++){
                template = template.replace('{' + i + '}', arguments[i]);
            }

        }else{
            template = key;
        }

        return template;
    };

    Dolphin.i18n.load = function (code, param) {
        var _this = this;
        Dolphin.ajax($.extend({}, param, {
            url : this.defaults.url.replace('{id}', code),
            onSuccess : function (reData) {
                if(param.callback){
                    param.callback.call(_this, reData);
                }
            }
        }));
    }
})(jQuery);