Gary.nodejs = {
	socket: null,
	isConnect: false,
	ip: 'localhost',
	port: 9106,
	isConnectServer: false,
	connect: function(opts){
		var me = this;
        if(!opts.url){
            this.socket = io();
        }else{
            this.socket = io.connect(opts.url);
        }
		if(opts.events.onMessage && typeof opts.events.onMessage === "function"){
			this.socket.on('message', opts.events.onMessage);
		}
        this.socket.on('connect', function(){
        	me.isConnect = true;
//        	me.init();
        	if(opts.events.onConnect && typeof opts.events.onConnect === "function"){
        		opts.events.onConnect();
        	}
        });
        this.socket.on('disconnect', function(){
        	me.isConnect = false;
        	me.isConnectServer = false;
        	Gary.showInfo(Gary.language.defaultLang.error.socketioError, Gary.language.defaultLang.warning);
        	if(opts.events.onDisconnect && typeof opts.events.onDisconnect === "function"){
        		opts.events.onDisconnect();
        	}
        });
        this.socket.on('reconnect', function(){
        	me.isConnect = true;
//        	me.init();
        	if(opts.events.onReconnect && typeof opts.events.onReconnect === "function"){
        		opts.events.onReconnect();
        	}
        });
        if(opts.events.onReconnecting && typeof opts.events.onReconnecting === "function"){
        	this.socket.on('reconnecting', opts.events.onReconnecting);
        }
        this.socket.on('reconnect_failed', function(){
        	me.isConnect = false;
        	me.isConnectServer = false;
        	Gary.showInfo(Gary.language.defaultLang.error.socketioError, Gary.language.defaultLang.warning);
        	if(opts.events.onReconnectFailed && typeof opts.events.onReconnectFailed === "function"){
        		opts.events.onReconnectFailed();
        	}
        });
        this.socket.on('connect_failed', function(){
        	me.isConnect = false;
        	me.isConnectServer = false;
        	Gary.showInfo(Gary.language.defaultLang.error.socketioError, Gary.language.defaultLang.warning);
        	if(opts.events.onConnectFailed && typeof opts.events.onConnectFailed === "function"){
        		opts.events.onConnectFailed();
        	}
        });
		return this.socket;
	},
	send: function(msg, name){
		if(!this.isConnect)return;
		if(name)
			this.socket.emit(name, msg);
		else
			this.socket.send(msg);
	},
	init: function(){
		var me = this;
		if(me.socket && me.isConnect && !me.isConnectServer){
			var id = me.socket.socket.sessionid;
			Ext.Ajax.request({
	    	    url: Gary.config.base + Gary.config.action.initNodejsSocket + Gary.config.urlPattern, 
	    	    params: {
	    	    	name: App.user._name,
	    	    	id: id
	    	    },
	    	    success: function(response, opts) {
	    	    	var data = Gary.loadCheck(response);
	    	    	if(!data){
	    	    		me.isConnectServer = false;
	    	    		me.socket.socket.disconnect();
	    	    		Gary.showInfo(Gary.language.defaultLang.error.socketioError, Gary.language.defaultLang.warning);
	    	    	}else{
	    	    		me.isConnectServer = true;
	    	    		Gary.showInfo(Gary.language.defaultLang.error.socketioSuccess, Gary.language.defaultLang.prompt);
	    	    	}
	    	    },
	    	    failure: function(response, opts) {
	    	    	me.isConnectServer = false;
	    	    	me.socket.socket.disconnect();
	    	    	Gary.loadCheck(response);
	    	    }
    	    });
		}
	}
}