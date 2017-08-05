/**
 * ### Attention please: we don't need the Node Type[folder,leaf], when we use horizontalTree --Anjing
 */

(function ($) {
    var thisTool = Dolphin;

    function HORIZONTAL_TREE(param) {
        this.init(param);
        if (this.opts.data) {
            this.loadData(this.opts.data);
        } else if (this.opts.url) {
            this.load(null, null);
        }

        return this;
    }

    HORIZONTAL_TREE.defaults = {
        //required
        panel: null,								//
        url: null,
        data: null,

        //options
        fluid: false,
        idField: "id",
        nameField: "name",
        childrenField: "children",
        loadingFlag: true,
        ajax: thisTool.ajax,
        mockPathData: null,
        levelTitle: null,
        singleRoot: false,
        itemType: null,
        defaultId : -1,
        requestKey : 'id',

        buttons: [],
        buttonDefaultClass: 'btn-primary',
        itemButtons: [],

        //icon
        icon: {},

        queryParams : null,

        dataFilter: null
    };


    HORIZONTAL_TREE.prototype = {
        /* ==================== property ================= */
        constructor: HORIZONTAL_TREE,
        __panel__: null,
        panel: null,
        data: null,
        selectedItem: null,
        itemPanel: {},
        //TODO 强制触发刷新
        reloadFlag : false,

        /* ===================== method ================== */
        init: function (param) {
            this.opts = $.extend({}, HORIZONTAL_TREE.defaults, param);

            this.initLayout();

            return this;
        },

        initLayout: function () {
            var _this = this,
                horizontal_tree, table, tbody, tr, td,
                i;

            horizontal_tree = $('<div class="_horizontal_tree">').appendTo(this.opts.panel);
            if (_this.opts.fluid) {
                horizontal_tree.addClass('_horizontal_fluid');
            }
            table = $('<table>').appendTo(horizontal_tree);
            tbody = $('<tbody>').appendTo(table);
            this.panel = $('<tr>').appendTo(tbody);
            this.__panel__ = horizontal_tree;

            return this;
        },

        loadData: function (node, data) {
            var _this = this;
            if (node) {
                node[_this.opts.childrenField] = data;
            } else {
                this.data = data;
            }
            this.renderLevel(data, node);
            this.complete();

            return this;
        },
        load: function (node, url, param) {
            var _this = this,
                data = $.extend(true, {}, this.opts.queryParams);
            if (url) {
                _this.opts.url = url;
            } else {
                url = _this.opts.url;
            }

            if (node) {
                data[_this.opts.requestKey] = node[_this.opts.idField];
                url = _this.opts.url.replace('{'+_this.opts.requestKey+'}', node[_this.opts.idField]);
            } else {
                data[_this.opts.requestKey] = _this.opts.defaultId;
                url = _this.opts.url.replace('{'+_this.opts.requestKey+'}', _this.opts.defaultId);
            }

            this.opts.ajax({
                url: url,
                mockPathData: _this.opts.mockPathData,
                loading: _this.opts.loadingFlag,
                data: data,
                onSuccess: function (reData) {
                    if (typeof _this.opts.dataFilter == 'function') {
                        reData = _this.opts.dataFilter.call(_this, reData);
                    }

                    if (node) {
                        node[_this.opts.childrenField] = reData.rows;
                    } else {
                        _this.data = reData.rows;
                        _this.panel.empty();
                    }
                    _this.renderLevel(reData.rows, node);

                    _this.complete();
                }
            });
        },

        renderLevel: function (data, parent) {
            //在商品新增的品类选择界面，不需要在扩展新的列出来
            if(parent!=null
                && this.opts.buttons.length==0
                && parent[this.opts.childrenField].length==0)
                return;

            var _this = this, _data = data || this.data,
                col, title, level, items, item, buttons, button,
                i, _level = $(this.panel).children('td').length;

            col = $('<td>').appendTo(_this.panel);

            level = $('<div class="_level">').attr('data-parentId', parent && parent[_this.opts.idField]).appendTo(col);

            if (_data.title) {
                title = $('<div class="_title">').html(_data.title).appendTo(level);
            } else if (_this.opts.levelTitle) {
                title = $('<div class="_title">').appendTo(level);
                if (_level < _this.opts.levelTitle.length) {
                    title.html(_this.opts.levelTitle[_level]);
                } else {
                    title.html("level : " + _level);
                }
            }

            items = $('<div class="_items">').appendTo(level);
            $.each(_data, function (i, itemData) {
                //将节点拼接起来，使每个叶子节点可以追溯到根节点
                itemData.parent = parent;

                //设置其type为folder or leaf
                if (itemData.children && itemData.children.length > 0) {
                    itemData.type = 'folder';
                } else {
                    itemData.type = 'leaf';
                }
                _this.addItem(itemData, items);
            });

            if (!_this.opts.singleRoot || (_this.opts.singleRoot && parent)) {
                buttons = $('<div class="_button">').appendTo(level);
                $.each(_this.opts.buttons, function (i, buttonData) {
                    button = $('<button class="btn btn-xs">').addClass(buttonData.class || _this.opts.buttonDefaultClass)
                        .html(buttonData.name).attr(buttonData.attr).appendTo(buttons);
                    if (typeof buttonData.click == 'function') {
                        button.click(function (event) {
                            buttonData.click.call(_this, data, parent, this, event);
                        });
                    }
                });
            }

            return _this;
        },
        addItem: function (data, panel, parent) {
            var _this = this,
                item, i, buttons, name;
            item = $('<div class="_item">').attr('id', data[_this.opts.idField]).appendTo(panel);

            if (typeof _this.opts.nameField === 'function') {
                name = _this.opts.nameField.call(_this, data)
            } else {
                name = data[_this.opts.nameField];
            }

            $('<span class="_itemName">').attr('title', name).html(name).appendTo(item);
            if (data.type == "folder") {
                $('<span class="glyphicon glyphicon-play float-right">').appendTo(item);
            }

            if (_this.opts.itemButtons) {
                buttons = $('<span class="_itemButtons">').appendTo(item);

                $.each(_this.opts.itemButtons, function (i, b) {
                    $('<span class="glyphicon">').addClass(b.icon).click(function (event) {
                        b.click.call(_this, data, parent, item);
                        event.stopPropagation();
                        return false;
                    }).appendTo(buttons);
                });
            }

            item.click(function (event) {
                _this.click.call(_this, data, this, event);
            });

            if (parent && parent[_this.opts.childrenField]) {
                parent[_this.opts.childrenField].push(data);
            }
        },
        reload : function (url, param) {
            this.load(null, url, param);
        },
        reloadLevel : function (parentId) {
            if(parentId){
                //TODO 强制触发刷新
                this.reloadFlag = true;
                $('div._item[id="' + parentId + '"]').click();
            }else{
                this.reload();
            }
        },
        reloadItem: function (id, data) {
            var _this = this;
            var item, itemPanel, name, _url, _data;
            if (typeof id === 'string') {
                item = _this.findItem(id);
            } else {
                item = _this.findItem(id[_this.opts.idField]);
            }
            itemPanel = $('div._item[id="' + item[_this.opts.idField] + '"]');

            if (data) {
                $.extend(item, data);
                if (typeof _this.opts.nameField === 'function') {
                    name = _this.opts.nameField.call(_this, data)
                } else {
                    name = data[_this.opts.nameField];
                }
                itemPanel.find('._itemName').attr('title', name).html(name);

                itemPanel.click();
            } else {
                _data = $.extend({}, _this.opts.queryParams);
                if (item[_this.opts.idField]) {
                    _data[_this.opts.requestKey] = item[_this.opts.idField];
                    _url = _this.opts.url.replace('{'+_this.opts.requestKey+'}', item[_this.opts.idField]);
                } else {
                    _data[_this.opts.requestKey] = _this.opts.defaultId;
                    _url = _this.opts.url.replace('{'+_this.opts.requestKey+'}', _this.opts.defaultId);
                }

                this.opts.ajax({
                    url: _url,
                    data : _data,
                    mockPathData: _this.opts.mockPathData,
                    loading: _this.opts.loadingFlag,
                    onSuccess: function (reData) {
                        if (reData.rows && reData.rows[0]) {
                            $.extend(Dolphin.emptyObj(item), reData.rows[0]);
                            if (typeof _this.opts.nameField === 'function') {
                                name = _this.opts.nameField.call(_this, item)
                            } else {
                                name = item[_this.opts.nameField];
                            }
                            itemPanel.find('._itemName').attr('title', name).html(name);
                            itemPanel.removeClass('active');
                            itemPanel.click();
                        }
                    }
                });

            }
        },
        findItem: function (id) {
            var item, _this = this;
            item = traversal(_this.data);

            function traversal(data) {
                var i, item;
                for (i = 0; i < data.length; i++) {
                    if (data[i][_this.opts.idField] == id) {
                        return data[i];
                    } else {
                        if (data[i][_this.opts.childrenField]) {
                            item = arguments.callee(data[i][_this.opts.childrenField]);
                            if (item) {
                                return item
                            }
                        }
                    }
                }

                return null;
            }

            return item;
        },

        click: function (itemData, thisItem, event) {
            var _this = this;
            //TODO 强制触发刷新
            if (!$(thisItem).hasClass('active') || _this.reloadFlag) {
                $(thisItem).closest('td').nextAll().remove();

                $(thisItem).siblings(".active").removeClass('active');
                $(thisItem).addClass('active');

                //if(itemData.type == "folder" || _this.opts.buttons.length>0){
                if (itemData[_this.opts.childrenField] && !_this.reloadFlag) {
                    _this.loadData(itemData, itemData[_this.opts.childrenField]);
                } else {
                    _this.load(itemData);
                }
                _this.reloadFlag = false;
                //}
            }

            $(thisItem).closest('table').find('.selected').removeClass('selected');
            $(thisItem).addClass('selected');
            _this.selectedItem = itemData;

            var levelTd = $(thisItem).closest('td');
            var scrollLeft = 0;
            levelTd.prevAll('td').each(function () {
                scrollLeft += $(this).width();
            });
            this.__panel__.animate({scrollLeft:scrollLeft},500);

            if (typeof _this.opts.click === 'function') {
                _this.opts.click.call(thisItem, itemData, event);
            }
        },

        complete: function () {

        }
    };

    thisTool.HORIZONTAL_TREE = HORIZONTAL_TREE;
})(jQuery);