Ext.define(Gary.config.com + '.{modularIdentifer}', {
    extend: 'Ext.Gary.desktop.Module',
    id: Gary.config.com + '.{modularIdentifer}',
    init : function(){
        this.launcher = {
            text: '{modularName}'
        };
    },

    createWindow : function(){
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow(Gary.config.com + '.{modularIdentifer}');
        if(!win){
            win = desktop.createWindow({
                id: Gary.config.com + '.{modularIdentifer}',
                title:'{modularName}'
            });
        }
        return win;
    }
});