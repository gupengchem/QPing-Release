/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved.
 */

module.exports = [
    /* 1 */
    {
        "_id" : "82e687c8-5a71-4174-898c-d317bc22e3b8",
        "name" : "系统管理",
        "code" : "sysMgr",
        "sort" : 100,
        "link" : "/view/system/auth/userManagement",
        "parent" : "",
        "state" : 1,
        "__type" : "folder",
        "icon" : "fa-gear"
    },

    /* 2 */
    {
        "_id" : "6926527e-7e1c-48c2-8995-ca0140b7deeb",
        "code" : "User",
        "link" : "/view/system/auth/userManagement",
        "name" : "账号管理",
        "parent" : "1b746d8b-f65c-4d91-9a60-8b72f6c0e090",
        "sort" : 3,
        "state" : 1,
        "__type" : "leaf",
        "icon" : "fa-user"
    },

    /* 3 */
    {
        "_id" : "8910a997-e081-45a6-8dff-9ed1106c5456",
        "code" : "Menu",
        "link" : "/view/system/menuManagement",
        "name" : "菜单管理",
        "parent" : "82e687c8-5a71-4174-898c-d317bc22e3b8",
        "sort" : 5,
        "state" : 1,
        "__type" : "leaf",
        "icon" : " fa-bars"
    },

    /* 4 */
    {
        "_id" : "33ee29c8-a240-43f0-abcd-4ec9c2142e65",
        "name" : "首页",
        "code" : "index",
        "sort" : 1,
        "link" : "/",
        "parent" : "",
        "state" : 1,
        "__type" : "leaf",
    },

    /* 5 */
    {
        "_id" : "36d7c2f2-699a-4ff6-93b9-5ca84230241a",
        "name" : "角色管理",
        "code" : "Role",
        "sort" : 5,
        "link" : "/view/system/auth/roleManagement",
        "parent" : "1b746d8b-f65c-4d91-9a60-8b72f6c0e090",
        "state" : 1,
        "__type" : "leaf",
        "icon" : "fa-user-md"
    },

    /* 6 */
    {
        "_id" : "7c2f74e2-a9b9-499e-9604-6ea3c8b28a47",
        "name" : "数据字典",
        "code" : "Dict",
        "link" : "/view/system/dictManagement",
        "sort" : 7,
        "parent" : "82e687c8-5a71-4174-898c-d317bc22e3b8",
        "state" : 1,
        "__type" : "leaf",
        "icon" : "fa-book"
    },

    /* 7 */
    {
        "_id" : "1b746d8b-f65c-4d91-9a60-8b72f6c0e090",
        "name" : "人员管理",
        "code" : "UserMgr",
        "link" : "",
        "sort" : 1,
        "parent" : "82e687c8-5a71-4174-898c-d317bc22e3b8",
        "state" : 1,
        "__type" : "folder",
        "icon" : "fa-users"
    },

    /* 8 */
    {
        "_id" : "b999bab8-11dd-44bc-abef-a9a77d52a929",
        "name" : "图标一览",
        "code" : "iconList",
        "link" : "/view/system/iconList",
        "icon" : "fa-picture-o",
        "sort" : 100,
        "parent" : "82e687c8-5a71-4174-898c-d317bc22e3b8",
        "state" : 1,
        "__type" : "leaf",
    },

    /* 9 */
    {
        "_id" : "ee621bc5-4b20-45ad-9c2c-c265768e3c30",
        "name" : "租户管理",
        "code" : "TenantMgr",
        "link" : "/view/system/tenantManagement",
        "icon" : "fa-credit-card",
        "sort" : 0,
        "parent" : "82e687c8-5a71-4174-898c-d317bc22e3b8",
        "state" : 1,
        "__type" : "leaf",
    },

    /* 10 */
    {
        "_id" : "b7b40e4e-9c1b-4368-962a-0be28a4a307d",
        "name" : "组织管理",
        "code" : "Org",
        "link" : "/view/system/auth/orgManagement",
        "icon" : " fa-sitemap",
        "sort" : 4,
        "parent" : "1b746d8b-f65c-4d91-9a60-8b72f6c0e090",
        "state" : 1,
        "__type" : "leaf",
    },

    /* 11 */
    {
        "_id" : "a58bb953-fd92-4869-9b94-36984179b774",
        "name" : "系统工具",
        "code" : "systemTool",
        "link" : "",
        "icon" : "fa-wrench",
        "sort" : 3,
        "parent" : "82e687c8-5a71-4174-898c-d317bc22e3b8",
        "state" : 1,
        "__type" : "folder",
    },

    /* 12 */
    {
        "_id" : "b424793f-e4c6-4634-8192-dae7c46ef465",
        "name" : "文件管理",
        "code" : "U_File",
        "link" : "/view/system/tool/fileManagement",
        "icon" : "fa-file",
        "sort" : 1,
        "parent" : "a58bb953-fd92-4869-9b94-36984179b774",
        "state" : 1,
        "__type" : "leaf",
    },

    /* 13 */
    {
        "_id" : "7d4f7f66-9cbb-4565-a10d-6d49d7dc05f0",
        "name" : "模型管理",
        "code" : "MetaModel",
        "link" : "/view/metaModel/productList",
        "icon" : "fa-puzzle-piece",
        "sort" : 50,
        "parent" : "",
        "state" : 1,
        "__type" : "folder",
    },

    /* 14 */
    {
        "_id": "adc01d2e-b6a2-4180-bab1-1fe28f5444ff",
        "name": "属性管理",
        "code": "Attribute",
        "link": "/view/metaModel/attributeManagement",
        "icon": "fa-th-list",
        "sort": 5,
        "parent": "7d4f7f66-9cbb-4565-a10d-6d49d7dc05f0",
        "state": 1,
        "__type": "leaf",
    },

    /* 15 */
    {
        "_id" : "fa0e2c1a-8f14-4243-82e8-0f45c6dff316",
        "name" : "模型管理",
        "code" : "model",
        "link" : "/view/metaModel/modelManagement",
        "icon" : "fa-sitemap",
        "sort" : 3,
        "parent" : "7d4f7f66-9cbb-4565-a10d-6d49d7dc05f0",
        "state" : 1,
        "__type" : "leaf",
    },

    /* 16 */
    {
        "_id" : "8dbceeab-5322-4b51-ac14-7489cbb13943",
        "name" : "产品管理",
        "code" : "Product",
        "link" : "/view/metaModel/productList",
        "icon" : "fa-gift",
        "sort" : 1,
        "parent" : "7d4f7f66-9cbb-4565-a10d-6d49d7dc05f0",
        "state" : 1,
        "__type" : "leaf",
    },
];
