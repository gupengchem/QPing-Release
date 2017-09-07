/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved.
 */

module.exports = [
    /* 1 */
    {
        "name" : "文件业务类型",
        "code" : "fileFolder",
        "state" : 1,
        "options" : [
            {
                "text" : "无",
                "state" : 1
            },
            {
                "text" : "测试",
                "code" : "test",
                "state" : 1
            }
        ],
    },

    /* 2 */
    {
        "code" : "sex",
        "name" : "性别",
        "state" : 1,
        "options" : [
            {
                "code" : "male",
                "text" : "男",
                "state" : 1
            },
            {
                "code" : "female",
                "text" : "女",
                "state" : 1
            }
        ],
    },

    /* 3 */
    {
        "code" : "Boolean",
        "name" : "布尔值",
        "state" : 1,
        "options" : [
            {
                "code" : "1",
                "text" : "是",
                "state" : 1
            },
            {
                "code" : "0",
                "text" : "否",
                "state" : 1
            }
        ],
    },

    /* 4 */
    {
        "code" : "formInputType",
        "name" : "表单输入类型",
        "state" : 1,
        "options" : [
            {
                "text" : "文本",
                "code" : "string",
                "state" : 1
            },
            {
                "text" : "选择",
                "code" : "select",
                "state" : 1
            },
            {
                "text" : "数字",
                "code" : "number",
                "state" : 1
            }
        ],
    },

    /* 5 */
    {
        "code" : "attributeBelong",
        "name" : "属性类型",
        "state" : 1,
        "options" : [
            {
                "code" : "inherit",
                "text" : "继承",
                "state" : 1
            },
            {
                "code" : "self",
                "text" : "自有",
                "state" : 1
            }
        ],
    },



    /* 6 */
    {
        "code" : "validateType",
        "name" : "验证类型",
        "state" : 1,
        "options" : [
            {
                "code" : "EMAIL",
                "text" : "企业邮箱",
                "state" : 1
            },
            {
                "code" : "PIN",
                "text" : "安全码",
                "state" : 1
            }
        ],
    },

    /* 7 */
    {
        "code" : "orgCategory",
        "name" : "组织级别",
        "state" : 1,
        "options" : [
            {
                "code" : "1",
                "text" : "客户",
                "state" : 1
            },
            {
                "code" : "2",
                "text" : "站点",
                "state" : 1
            },
            {
                "code" : "3",
                "text" : "服务线",
                "state" : 1
            }
        ],
    },
];