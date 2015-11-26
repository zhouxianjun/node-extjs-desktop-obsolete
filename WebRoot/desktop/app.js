Ext.define('Ext.Gary.App', {
    extend: 'Ext.Gary.desktop.App',
    init: function() {
        this.callParent();
    },
    modules: [],
    user: {},
    getModules : function(){
        var reqsz = new Array();
        window.reqMaxicon = new Array();
        window.reqMinicon = new Array();
        for(var i = 0 ; i < this.modules.length ; i++){
            reqsz[i] = Ext.create(this.modules[i]);
            var obj = reqsz[i].launcher;
            var iconMax = (obj.iconCls || 'icon-' + reqsz[i].id.replace('.','-')) + '-max' + (Ext.isIE6 ? '-ie6' : '');
            var iconMin = (obj.iconCls || 'icon-' + reqsz[i].id.replace('.','-')) + '-min' + (Ext.isIE6 ? '-ie6' : '');
            reqMaxicon[i] = {name: obj.text, iconCls: iconMax, module: reqsz[i].id, tip: obj.tip || obj.text};
            reqMinicon[i] = {name: obj.text, iconCls: iconMin, module: reqsz[i].id};
            reqsz[i].launcher.iconCls = iconMin;
        }
        return reqsz;
    },
    getDesktopConfig: function () {
        var me = this, ret = me.callParent();
        return Ext.apply(ret, {
            contextMenuItems: [{
                text: Gary.language.defaultLang.changeBackground,
                handler: me.onSettings,
                scope: me
            },{
                text: Gary.language.defaultLang.setRights,
                handler: me.onSettingsAuth,
                minWindows: me.user.sys ? 0 : 1,
                scope: me
            },{
                text: Gary.language.defaultLang.modularMgr,
                handler: me.onModularMgr,
                minWindows: me.user.sys ? 0 : 1,
                scope: me
            },{
                text: Gary.language.defaultLang.autoArrange,
                handler: me.handleUpdate,
                scope: me
            }],
            shortcuts: Ext.create('Ext.data.Store', {
                model: 'Ext.Gary.desktop.ShortcutModel',
                data: window.reqMaxicon
            }),
            wallpaper: 'wallpapers/Blue-Sencha.jpg',
            wallpaperStretch: false
        });
    },

    // config for the start menu
    getStartConfig : function() {
        var me = this, ret = me.callParent();

        return Ext.apply(ret, {
            title: me.user.nickName,
            iconCls: me.user.icon,
            height: 300,
            toolConfig: {
                width: 100,
                items: [{
                    text:'Settings',
                    iconCls:'settings',
                    handler: me.onSettings,
                    scope: me
                },
                    '-',{
                        text:Gary.language.defaultLang.logout,
                        iconCls:'logout',
                        handler: me.onLogout,
                        scope: me
                    }
                ]
            }
        });
    },

    getTaskbarConfig: function () {
        var ret = this.callParent();

        return Ext.apply(ret, {
            quickStart: window.reqMinicon,
            trayItems: [
                { xtype: 'trayclock', flex: 1 }
            ]
        });
    },

    onLogout: function () {
        Ext.Msg.confirm(Gary.language.defaultLang.logout, Gary.language.defaultLang.msg.logout, function(btn){
            if(btn == 'yes'){
                Ext.Ajax.request({
                    url: Gary.config.base + Gary.config.action.logout + Gary.config.urlPattern,
                    success: function(response, opts) {
                        var data = Gary.loadCheck(response);
                        if(data){
                            Ext.Msg.alert(Gary.language.defaultLang.prompt,data.executeResult.resultMsg,function(){
                                window.location.href = 'logout.jsp';
                            });
                        }
                    },
                    failure: function() {
                        Gary.loadCheck(this.response);
                    }
                });
            }
        });
    },

    onSettings: function () {
        var dlg = new Ext.Gary.Settings({
            desktop: this.desktop
        });
        dlg.show();
    },
    onSettingsAuth: function () {
        if(!this._auth){
            this._auth = new Ext.Gary.Settings.Auth({
                desktop: this.desktop
            });
        }
        this._auth.show();
    },
    onModularMgr: function () {
        if(!this._modularMgr){
            this._modularMgr = new Ext.Gary.ModularMgr({
                desktop: this.desktop
            });
        }
        this._modularMgr.show();
    },
    initShortcut : function() {
        //两个图标上下距离
        var btnHeight = 60;
        //两个图标左右距离
        var btnWidth = 60;
        //填充
        var btnPadding = 30;
        var col = null;
        var row = null;
        //最下面图标的位置
        var bottom;
        var numberofIterms = 0;
        var bodyHeight = Ext.getBody().getHeight();
        function initColRow() {
            col = {
                index : 1,
                x : btnPadding
            };
            row = {
                index : 1,
                y : btnPadding
            };
        }

        //initColRow();

        function isOverflow(value, bottom) {
            //value > 8 ||
            if ( bodyHeight < bottom) {
                return true;
            }
            return false;
        }
        //定位图标的X/Y坐标
        this.setXY = function(item) {
            bodyHeight = Ext.getBody().getHeight();
            numberofIterms += 1;
            bottom = row.y + btnHeight;
            overflow = isOverflow(numberofIterms, bottom);
            if (overflow && bottom > (btnHeight + btnPadding)) {
                numberofIterms = 0;
                col = {
                    index : col.index++,
                    x : col.x + btnWidth + btnPadding
                };
                row = {
                    index : 1,
                    y : btnPadding
                };
            }
            if(col.x == btnPadding){
                Ext.fly(item).setXY([col.x - (btnPadding - 10), row.y - 20]);
            }else{
                Ext.fly(item).setXY([col.x, row.y  - 20]);
            }
            row.index++;
            row.y = row.y + btnHeight + btnPadding;
        };

        this.handleUpdate = function() {
            initColRow();
            var items = Ext.query(".ux-desktop-shortcut");
            for (var i = 0, len = items.length; i < len; i++) {
                this.setXY(items[i]);
            }
        };
        this.handleUpdate();
        Ext.EventManager.onWindowResize(this.handleUpdate, this, {delay:100});
    }
});
