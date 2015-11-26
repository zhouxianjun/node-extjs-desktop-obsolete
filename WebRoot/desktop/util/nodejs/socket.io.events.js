Gary.nodejs.events = {
	onMessage: function(data){
		if(!App.user)return;
		data = Ext.decode(data);
		if(data.doWhat == 'auth'){
			Gary.replaceCss('css/modular-icon.css', 'css/modular-icon.css');
			//Gary.initDesktop(App.user);
			if(confirm('权限已重置,是否重新加载?')){
				window.location.reload();
			}
		}if(data.doWhat == 'modular'){
			Gary.replaceCss('css/modular-icon.css', 'css/modular-icon.css');
		}else if(data.doWhat == 'msg'){
			Gary.showMsg(data.msg, data.title);
		}else if(data.doWhat == 'monitoring'){
			var m = App.getDesktop().getWindow(Gary.config.com + '.SysMonitoring');
			if(m){
				m.loadData(data);
			}
		}
	},
    onConnect: function(){
        Gary.showInfo(Gary.language.defaultLang.error.socketioSuccess, Gary.language.defaultLang.prompt);
    }
}