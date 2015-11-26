Ext.define(Gary.config.com + '.PlanMgr', {
    extend: 'Ext.Gary.desktop.Module',
    id: Gary.config.com + '.PlanMgr',
    init : function(){
        this.launcher = {
            text: '资费管理'
        };
    },

    createWindow : function(){
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow(Gary.config.com + '.PlanMgr');
        if(!win){
            win = desktop.createWindow({
                id: Gary.config.com + '.PlanMgr',
                title:'资费管理'
            });
        }
        return win;
    }
});

