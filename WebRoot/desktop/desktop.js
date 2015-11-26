Ext.define('Ext.Gary.desktop.Desktop', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.desktop',
    activeWindowCls: 'ux-desktop-active-win',
    inactiveWindowCls: 'ux-desktop-inactive-win',
    lastActiveWindow: null,
    border: false,
    html: '&#160;',
    layout: 'fit',
    xTickSize: 1,
    yTickSize: 1,
    app: null,
    shortcuts: null,
    shortcutItemSelector: 'div.ux-desktop-shortcut',
    shortcutTpl: [
        '<tpl for=".">',
        '<div class="ux-desktop-shortcut" tip="{tip}" id="{module}-shortcut">',
        '<div class="ux-desktop-shortcut-icon {iconCls}">',
        '<img src="',Ext.BLANK_IMAGE_URL,'" title="{name}">',
        '</div>',
        '<span class="ux-desktop-shortcut-text">{name}</span>',
        '</div>',
        '</tpl>',
        '<div class="x-clear"></div>'
    ],
    taskbarConfig: null,
    windowMenu: null,
    initComponent: function () {
        Gary.desktop = this;
        var me = this;
        me.windowMenu = new Ext.menu.Menu(me.createWindowMenu());
        me.bbar = me.taskbar = new Ext.Gary.desktop.TaskBar(me.taskbarConfig);
        me.taskbar.windowMenu = me.windowMenu;
        me.windows = new Ext.util.MixedCollection();
        me.contextMenu = new Ext.menu.Menu(me.createDesktopMenu());
        me.items = [
            { xtype: 'wallpaper', id: me.id+'_wallpaper' },
            me.createDataView()
        ];
        me.callParent();
        me.shortcutsView = me.items.getAt(1);
        me.shortcutsView.on('itemclick', me.onShortcutItemClick, me);
        var wallpaper = me.wallpaper;
        me.wallpaper = me.items.getAt(0);
        if (wallpaper) {
            me.setWallpaper(wallpaper, me.wallpaperStretch);
        }
        me.shortcutsView.on('render', me.onRenderShortcut, me);
    },
    onRenderShortcut: function(v) {
        var me = this;
        var lis = setInterval(function(){
            if(v.all.elements.length > 0){
                clearInterval(lis);
                var isDD = false;
                for(var i = 0; i < v.all.elements.length;i++){
                    Ext.create('Ext.tip.ToolTip', {
                        target: v.all.elements[i],
                        html: v.all.elements[i].attributes['tip'].nodeValue,
                        trackMouse: true            //  跟随鼠标移动
                    });
                    var t_d = new Ext.dd.DDProxy(v.all.elements[i],'linkDDGroup',{isTarget:false});
                    t_d.onMouseUp = function(e){
                        if(isDD){
                            isDD = false;
                            Ext.get(this.id).frame('#8db2e3', 1);
                            me.shortcutsView.on("itemclick",me.onShortcutItemClick,me);
                        }
                    }
                    t_d.startDrag = function(e){
                        isDD = true;
                        me.shortcutsView.un("itemclick");
                        while (this.getDragEl().firstChild) {
                            var oldNode = this.getDragEl().removeChild(this.getDragEl().firstChild);
                            oldNode = null;
                        }
                        for(var i = 0; i < this.getEl().childNodes.length; i++){
                            var temp = this.getEl().childNodes[i].cloneNode(true);
                            this.getDragEl().appendChild(temp);
                        }
                        this.getDragEl().style.padding = '6px';
                        this.getDragEl().style.textAlign = 'center';
                    }
                }
            }
        },200);
    },
    afterRender: function () {
        var me = this;
        me.callParent();
        me.el.on('contextmenu', me.onDesktopMenu, me);
    },

    createDataView: function () {
        var me = this;
        return {
            xtype: 'dataview',
            overItemCls: 'x-view-over',
            trackOver: true,
            itemSelector: me.shortcutItemSelector,
            store: me.shortcuts,
            style: {
                position: 'absolute'
            },
            x: 0, y: 0,
            tpl: new Ext.XTemplate(me.shortcutTpl)
        };
    },

    createDesktopMenu: function () {
        var me = this, ret = {
            items: me.contextMenuItems || []
        };

        if (ret.items.length) {
            ret.items.push('-');
        }

        ret.items.push(
            { text: Gary.language.defaultLang.tileWindows, handler: me.tileWindows, scope: me, minWindows: 1 },
            { text: Gary.language.defaultLang.cascadeWindows, handler: me.cascadeWindows, scope: me, minWindows: 1 })

        return ret;
    },

    createWindowMenu: function () {
        var me = this;
        return {
            defaultAlign: 'br-tr',
            items: [
                { text: Gary.language.defaultLang.restore, handler: me.onWindowMenuRestore, scope: me },
                { text: Gary.language.defaultLang.minimize, handler: me.onWindowMenuMinimize, scope: me },
                { text: Gary.language.defaultLang.maximize, handler: me.onWindowMenuMaximize, scope: me },
                '-',
                { text: Gary.language.defaultLang.close, handler: me.onWindowMenuClose, scope: me }
            ],
            listeners: {
                beforeshow: me.onWindowMenuBeforeShow,
                hide: me.onWindowMenuHide,
                scope: me
            }
        };
    },
    onDesktopMenu: function (e) {
        var me = this, menu = me.contextMenu;
        e.stopEvent();
        if (!menu.rendered) {
            menu.on('beforeshow', me.onDesktopMenuBeforeShow, me);
        }
        menu.showAt(e.getXY());
        menu.doConstrain();
    },
    onDesktopMenuBeforeShow: function (menu) {
        var me = this, count = me.windows.getCount();

        menu.items.each(function (item) {
            var min = item.minWindows || 0;
            item.setDisabled(count < min);
        });
    },
    onShortcutItemClick: function (dataView, record) {
        var me = this, module = me.app.getModule(record.data.module),
            win = module && module.createWindow();

        if (win) {
            me.restoreWindow(win);
        }
    },
    onWindowClose: function(win) {
        var me = this;
        me.windows.remove(win);
        me.taskbar.removeTaskButton(win.taskButton);
        me.updateActiveWindow();
    },

    onWindowMenuBeforeShow: function (menu) {
        var items = menu.items.items, win = menu.theWin;
        items[0].setDisabled(win.maximized !== true && win.hidden !== true); // Restore
        items[1].setDisabled(win.minimized === true); // Minimize
        items[2].setDisabled(win.maximized === true || win.hidden === true); // Maximize
    },
    onWindowMenuClose: function () {
        var me = this, win = me.windowMenu.theWin;

        win.close();
    },
    onWindowMenuHide: function (menu) {
        menu.theWin = null;
    },
    onWindowMenuMaximize: function () {
        var me = this, win = me.windowMenu.theWin;

        win.maximize();
        win.toFront();
    },
    onWindowMenuMinimize: function () {
        var me = this, win = me.windowMenu.theWin;

        win.minimize();
    },
    onWindowMenuRestore: function () {
        var me = this, win = me.windowMenu.theWin;

        me.restoreWindow(win);
    },

    getWallpaper: function () {
        return this.wallpaper.wallpaper;
    },
    setTickSize: function(xTickSize, yTickSize) {
        var me = this,
            xt = me.xTickSize = xTickSize,
            yt = me.yTickSize = (arguments.length > 1) ? yTickSize : xt;

        me.windows.each(function(win) {
            var dd = win.dd, resizer = win.resizer;
            dd.xTickSize = xt;
            dd.yTickSize = yt;
            resizer.widthIncrement = xt;
            resizer.heightIncrement = yt;
        });
    },
    setWallpaper: function (wallpaper, stretch) {
        this.wallpaper.setWallpaper(wallpaper, stretch);
        return this;
    },

    cascadeWindows: function() {
        var x = 0, y = 0,
            zmgr = this.getDesktopZIndexManager();

        zmgr.eachBottomUp(function(win) {
            if (win.isWindow && win.isVisible() && !win.maximized) {
                win.setPosition(x, y);
                x += 20;
                y += 20;
            }
        });
    },
    createWindow: function(config, cls) {
        var me = this, win, cfg = Ext.applyIf(config || {}, {
            stateful: false,
            isWindow: true,
            constrainHeader: true,
            minimizable: true,
            maximizable: true,
            isAddNavigation: true,
            isAddTabPanel: true,
            width: Ext.isIE ? 896 : '70%',
            height: Ext.isIE ? 559 : '60%',
            iconCls: 'icon-' + config.id.replace('.','-') + '-min' + (Ext.isIE6 ? '-ie6' : ''),
            layout: 'border',
            _mined: true
        });
        cls = cls || Ext.window.Window;
        win = me.add(new cls(cfg));
        me.windows.add(win);
        win.taskButton = me.taskbar.addTaskButton(win);
        win.animateTarget = win.taskButton.el;
        if(cfg.isAddNavigation){
            win.treeStore = Ext.create('Ext.data.TreeStore', {
                nodeParam: 'node',
                model: 'TreeModel',
                autoLoad: true,
                proxy: {
                    type: 'ajax',
                    url: Gary.config.base + Gary.config.action.functions + Gary.config.urlPattern,
                    extraParams: {
                        modularIdentifer: config.id.substring(config.id.indexOf('.')+1),
                        isTree: true
                    },
                    reader: {
                        type: 'json',
                        root: ''
                    },
                    listeners: {
                        exception: Gary.loadError
                    }
                },
                listeners: {
                    beforeload: function(store, operation, eOpts){
                        if(!operation.node.isRoot() && operation.node.raw.fid)
                            operation.params.parentId = operation.node.raw.fid;
                    }
                }
            });
            win.add({
                xtype: 'ux_navigation',
                store: win.treeStore
            });
        }
        if(cfg.isAddTabPanel){
            win.leftTab = Ext.create('Ext.Gary.tab.Panel');
            win.add(win.leftTab);
        }
        win.on({
            show: function(w){
                if(!w._isShow){
                    w._isShow = true;
                    //w.treeStore.load();
                }
            },
            activate: me.updateActiveWindow,
            beforeshow: me.updateActiveWindow,
            deactivate: me.updateActiveWindow,
            minimize: me.minimizeWindow,
            destroy: me.onWindowClose,
            scope: me
        });
        win.on({
            boxready: function () {
                win.dd.xTickSize = me.xTickSize;
                win.dd.yTickSize = me.yTickSize;
                if (win.resizer) {
                    win.resizer.widthIncrement = me.xTickSize;
                    win.resizer.heightIncrement = me.yTickSize;
                }
            },
            single: true
        });
        // replace normal window close w/fadeOut animation:
        win.doClose = function ()  {
            win.doClose = Ext.emptyFn; // dblclick can call again...
            win.el.disableShadow();
            win.el.fadeOut({
                listeners: {
                    afteranimate: function () {
                        win.destroy();
                    }
                }
            });
        };
        return win;
    },

    getActiveWindow: function () {
        var win = null,
            zmgr = this.getDesktopZIndexManager();
        if (zmgr) {
            // We cannot rely on activate/deactive because that fires against non-Window
            // components in the stack.
            zmgr.eachTopDown(function (comp) {
                if (comp.isWindow && !comp.hidden) {
                    win = comp;
                    return false;
                }
                return true;
            });
        }
        return win;
    },
    getDesktopZIndexManager: function () {
        var windows = this.windows;
        // TODO - there has to be a better way to get this...
        return (windows.getCount() && windows.getAt(0).zIndexManager) || null;
    },

    getWindow: function(id) {
        return this.windows.get(id);
    },

    minimizeWindow: function(win) {
        win.minimized = true;
        win.hide();
    },

    restoreWindow: function (win) {
        if (win.isVisible()) {
            win.restore();
            win.toFront();
        } else {
            win.show();
        }
        return win;
    },

    tileWindows: function() {
        var me = this, availWidth = me.body.getWidth(true);
        var x = me.xTickSize, y = me.yTickSize, nextY = y;

        me.windows.each(function(win) {
            if (win.isVisible() && !win.maximized) {
                var w = win.el.getWidth();

                // Wrap to next row if we are not at the line start and this Window will
                // go off the end
                if (x > me.xTickSize && x + w > availWidth) {
                    x = me.xTickSize;
                    y = nextY;
                }

                win.setPosition(x, y);
                x += w + me.xTickSize;
                nextY = Math.max(nextY, y + win.el.getHeight() + me.yTickSize);
            }
        });
    },

    updateActiveWindow: function () {
        var me = this, activeWindow = me.getActiveWindow(), last = me.lastActiveWindow;
        if (activeWindow === last) {
            return;
        }

        if (last) {
            if (last.el.dom) {
                last.addCls(me.inactiveWindowCls);
                last.removeCls(me.activeWindowCls);
            }
            last.active = false;
        }

        me.lastActiveWindow = activeWindow;

        if (activeWindow) {
            activeWindow.addCls(me.activeWindowCls);
            activeWindow.removeCls(me.inactiveWindowCls);
            activeWindow.minimized = false;
            activeWindow.active = true;
        }
        me.taskbar.setActiveButton(activeWindow && activeWindow.taskButton);
    }
});
Ext.define("Ext.Gary.desktop.App",{mixins:{observable:"Ext.util.Observable"},isReady:false,modules:null,useQuickTips:true,constructor:function(a){var b=this;b.addEvents("ready","beforeunload");b.mixins.observable.constructor.call(this,a);if(Ext.isReady){Ext.Function.defer(b.init,10,b)}else{Ext.onReady(b.init,b)}},init:function(){var b=this,a;if(b.useQuickTips){Ext.QuickTips.init()}b.modules=b.getModules();if(b.modules){b.initModules(b.modules)}a=b.getDesktopConfig();b.desktop=new Ext.Gary.desktop.Desktop(a);b.viewport=new Ext.container.Viewport({layout:"fit",items:[b.desktop]});Ext.EventManager.on(window,"beforeunload",b.onUnload,b);b.isReady=true;b.fireEvent("ready",b)},getDesktopConfig:function(){var b=this,a={app:b,taskbarConfig:b.getTaskbarConfig()};Ext.apply(a,b.desktopConfig);return a},getModules:Ext.emptyFn,getStartConfig:function(){var b=this,a={app:b,menu:[]},c;Ext.apply(a,b.startConfig);Ext.each(b.modules,function(d){c=d.launcher;if(c){c.handler=c.handler||Ext.bind(b.createWindow,b,[d]);a.menu.push(d.launcher)}});return a},createWindow:function(a){var b=a.createWindow();b.show()},getTaskbarConfig:function(){var b=this,a={app:b,startConfig:b.getStartConfig()};Ext.apply(a,b.taskbarConfig);return a},initModules:function(a){var b=this;Ext.each(a,function(c){c.app=b})},getModule:function(d){var c=this.modules;for(var e=0,b=c.length;e<b;e++){var a=c[e];if(a.id==d||a.appType==d){return a}}return null},onReady:function(b,a){if(this.isReady){b.call(a,this)}else{this.on({ready:b,scope:a,single:true})}},getDesktop:function(){return this.desktop},onUnload:function(a){if(this.fireEvent("beforeunload",this)===false){a.stopEvent()}}});