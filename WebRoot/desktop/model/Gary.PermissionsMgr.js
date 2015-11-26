Ext.define(Gary.config.com + '.PermissionsMgr', {
    extend: 'Ext.Gary.desktop.Module',
    id: Gary.config.com + '.PermissionsMgr',
    init : function(){
        this.launcher = {
            text: '权限管理'
        };
    },

    createWindow : function(){
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow(Gary.config.com + '.PermissionsMgr');
        if(!win){
            win = desktop.createWindow({
                id: Gary.config.com + '.PermissionsMgr',
                title:'权限管理'
            });
        }
        return win;
    }
});