var App;
Ext.onReady(function () {
	function init(user){
		Gary.Gzip.load({
			files: 'desktop/util/plugs.js,desktop/util/model.js,desktop/desktop.js,desktop/app.js',
			id: 'app',
			sort: true,
			callback: function(response, opts){
				Gary.initDesktop(user,function(){
					winlogin.hide();
					Gary.initNodejsSoket();
				});
			}
		});
	}
	function login(){
    	var form = Ext.getCmp('loginForm').getForm();
    	if (form.isValid()) {
            form.submit({
            	waitTitle: '登录中...',
            	waitMsg:'正在登录,请稍候...',
                success: function(form, action) {
                	var data = Gary.loadCheck(this.response);
                	if(data){
                		init(data.data.admin);
                	}
                },
                failure: function(form, action) {
                	Gary.loadCheck(this.response);
                }
            });
        }
    };
	var winlogin = Ext.create('Ext.window.Window', {
        height: 200,
        width: 300,
        title: '中间件管理平台',
        closable: false,
        plain: true,
        layout: 'fit',
        buttonAlign: 'center',
        draggable: false,
        resizable: false,
        items: [{
    		xtype: 'form',
    		url: Gary.config.base + 'admin/login' + Gary.config.urlPattern,
		    //frame: true,
		    id: 'loginForm',
		    bodyStyle:'padding:20px 50px 0',
		    width: '100%',
		    fieldDefaults: {
		        msgTarget: 'side',
		        labelWidth: 55
		    },
		    defaultType: 'textfield',
		    defaults: {
		        anchor: '100%',
		        allowBlank:false,
		    	blankText: '不能为空!'
		    },
		    items: [{
		        fieldLabel: '帐号',
		        name: 'name'
		    },{
		    	name: 'password',
	            inputType: 'password',
	            fieldLabel: '密码',
		    	listeners: {
                    specialkey: function(field, e){
                    	if (e.getKey() == e.ENTER) {
                    		login();
                        }
                    }
                }
		    }]
    	}],
        buttons: [{
        	text: '登录',
        	id: 'longinBtn',
	        iconCls: 'icon-btn-login',
	        handler: function() {
	        	login();
	        }
        },{
	        text: '重置',
	        iconCls: 'icon-btn-reset',
	        handler: function() {
		        Ext.getCmp('loginForm').getForm().reset();
		    }
	    }]
    });
    function isLogin(response){
    	var data = Ext.decode(response.responseText);
    	if(response.status == 200 && data.success == true){
    		init(data.data.admin);
    	}else{
    		winlogin.show();
	    	setTimeout(function(){
		    	Ext.getCmp('loginForm').getForm().findField('name').focus();
		    },500);
    	}
    }
    Ext.Ajax.request({
	    url: Gary.config.base + Gary.config.action.isLogin + Gary.config.urlPattern,    
	    success: function(response, opts) {
	    	isLogin(response);
    	},
    	failure: function(response, opts) {
    		isLogin(response);
	    }
	});
});