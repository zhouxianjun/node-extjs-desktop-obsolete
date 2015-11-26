Ext.define(Gary.config.com + '.MiddlewareFunctionMgr', {
    extend: 'Ext.Gary.desktop.Module',
    id: Gary.config.com + '.MiddlewareFunctionMgr',
    init : function(){
        this.launcher = {
            text: '中间件功能管理'
        };
    },

    createWindow : function(){
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow(Gary.config.com + '.MiddlewareFunctionMgr');
        if(!win){
            win = desktop.createWindow({
                id: Gary.config.com + '.MiddlewareFunctionMgr',
                title:'中间件功能管理'
            });
        }
        return win;
    }
});

