/*
 * Copyright (c) 2016 Breezee.org. All Rights Reserved.
 */

module.exports = [
    {
        "name" : "首页",
        "code" : "index",
        "sort" : 1,
        "link" : "/",
        "parent" : "",
        "state" : 1,
        "_id" : "33ee29c8-a240-43f0-abcd-4ec9c2142e65",
    },
    {
        "name" : "系统管理",
        "code" : "sysMgr",
        "sort" : 100,
        "__type" : 'folder',
        "link" : "",
        "parent" : "",
        "state" : 1,
        "_id" : "82e687c8-5a71-4174-898c-d317bc22e3b8",
    },
    {
        "_id" : "6926527e-7e1c-48c2-8995-ca0140b7deeb",
        "code" : "User",
        "link" : "/view/auth/userManagement",
        "name" : "账号管理",
        "parent" : "82e687c8-5a71-4174-898c-d317bc22e3b8",
        "sort" : 3,
        "state" : 1,
    },
    {
        "_id" : "8910a997-e081-45a6-8dff-9ed1106c5456",
        "code" : "Menu",
        "link" : "/view/auth/menuManagement",
        "name" : "菜单管理",
        "parent" : "82e687c8-5a71-4174-898c-d317bc22e3b8",
        "sort" : 5,
        "state" : 1,
    },
    {
        "name" : "角色管理",
        "code" : "Role",
        "sort" : 1,
        "link" : "/view/auth/roleManagement",
        "parent" : "82e687c8-5a71-4174-898c-d317bc22e3b8",
        "state" : 1,
        "_id" : "36d7c2f2-699a-4ff6-93b9-5ca84230241a",
    },
    {
        "_id" : "414c8785-567c-4abe-b4e0-5decfa1c5cab",
        "name" : "分隔线",
        "code" : "__separator__1",
        "sort" : 6,
        "parent" : "82e687c8-5a71-4174-898c-d317bc22e3b8",
        "state" : 1,
        "__type" : "leaf",
        "__v" : 0
    },
    {
        "_id" : "7c2f74e2-a9b9-499e-9604-6ea3c8b28a47",
        "name" : "数据字典",
        "code" : "Dict",
        "link" : "/view/system/dictManagement",
        "sort" : 7,
        "parent" : "82e687c8-5a71-4174-898c-d317bc22e3b8",
        "state" : 1,
        "__type" : "leaf",
        "__v" : 0
    },
];
