Ext.define(Gary.config.com + '.AuthMgr', {
    extend: 'Ext.Gary.desktop.Module',
    id: Gary.config.com + '.AuthMgr',
    init : function(){
        this.launcher = {
            text: '授权管理'
        };
    },

    createWindow : function(){
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow(Gary.config.com + '.AuthMgr');
        if(!win){
            win = desktop.createWindow({
                id: Gary.config.com + '.AuthMgr',
                title:'授权管理'
            });
        }
        return win;
    }
});

