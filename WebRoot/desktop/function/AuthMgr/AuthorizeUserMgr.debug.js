Ext.define(Gary.config.com + '.AuthorizeUserMgr', {  
    extend: 'Ext.panel.Panel',  
    title: '授权用户管理',
    closable : true,
    id: Gary.config.com + '.AuthorizeUserMgr',
    layout:'border',
    initComponent: function() {
    	var mask = new Ext.LoadMask(this, {msg:"Please wait..."});
    	var authClientId = 0;
    	var authFunctions = [];
    	
    	var authFunctionGrid = Ext.create('Ext.Gary.grid.Panel', {
	       	columns: [{
	       		header: '功能名称',
	            dataIndex: 'name',
	            renderer : Gary.repMetadata
	       	},{
	       		header: '功能编号',
	            dataIndex: 'business'
	       	},{
	       		header: '功能类型',
	            dataIndex: 'type',
	        	renderer: function(v){
	        		return v == 'login' ? '登录' : '业务';
	        	}
	       	},{
	       		header: '功能描述',
	            dataIndex: 'memo',
	            renderer : Gary.repMetadata
	       	}],
            store: Gary.getStore({
            	model: 'MiddlewareFunction',
            	action: Gary.config.action.mgrcmt.functionList,
            	root: 'data.list.items',
            	page: 'data.list.count'
            }),
            selModel: new Ext.selection.CheckboxModel(),
	    });
    	
    	var functionWin = Ext.create('Ext.window.Window',{
			title: '选择要接入的功能',
			modal: true,
			constrainHeader: true,
			closeAction: 'hide',
	    	width: 500,
	    	layout: 'fit',
	    	items: [authFunctionGrid],
	    	buttons: [{
		        text: Gary.language.defaultLang.button.add,
		        iconCls: 'icon-btn-accept',
		        handler: function() {
		        	var select = authFunctionGrid.getSelectionModel().getSelection();
		        	if(select &&  select[0]){
		        		mask.show();
		        		var ids = [];
		        		if(console){
		        			console.log('修改之前功能:' + authFunctions);
		        		}
		        		for ( var i = 0; i < select.length; i++) {
		        			var have = false;
		        			for ( var j = 0; j < authFunctions.length; j++) {
								if(authFunctions[i] && authFunctions[i].business == select[i].data.business){
									have = true;
									break;
								}
							}
		        			if(!have){
		        				authFunctions.push(select[i].data);
		        			}
						}
		        		if(console){
		        			console.log('合并之后功能:' + authFunctions);
		        		}
		        		for ( var i = 0; i < authFunctions.length; i++) {
							ids.push(authFunctions[i].business);
						}
		        		Ext.Ajax.request({
                    	    url: Gary.config.base + Gary.config.action.mgrcmt.authAddFunction + Gary.config.urlPattern,
                    	    params: {
                    	    	funs: ids,
                    	    	authClientId: authClientId
                    	    },
                    	    success: function(response, opts) {
                    	    	mask.hide();
                    	    	var data = Gary.loadCheck(response);
                    	    	if(data){
                    	    		Ext.Msg.alert('提示',data.executeResult.resultMsg,function(){
                    	    			functionWin.hide();
                    	    			authFunctions = data.data.functions;
                    	    			if(console){
                		        			console.log('提交之后功能:' + authFunctions);
                		        		}
		    	    					grid.getStore().reload();
		    	    				});
                    	    	}
                    	    },
                    	    failure: function(response, opts) {
                    	    	Gary.loadCheck(response);
                    	    	mask.hide();
                    	    }
                    	});
		        	}
			    }
		    }]
		});
    	var ReasonsForRefusal = Ext.create('Ext.form.field.TextArea', {
    		anchor: '100%'
    	});
    	var verifyFailWin = Ext.create('Ext.window.Window',{
			title: '请输入拒绝理由',
			modal: true,
			constrainHeader: true,
			closeAction: 'hide',
	    	width: 300,
	    	layout: 'fit',
	    	items: [ReasonsForRefusal],
	    	buttons: [{
		        text: Gary.language.defaultLang.button.ok,
		        iconCls: 'icon-btn-accept',
		        handler: function() {
		        	var select = grid.getSelectionModel().getSelection();
		        	if(select &&  select[0]){
		        		mask.show();
		        		var ids = [];
		        		for ( var i = 0; i < select.length; i++) {
							ids.push(select[i].data.email);
						}
		        		var reasons = ReasonsForRefusal.getValue();
		        		Ext.Ajax.request({
	                	    url: Gary.config.base + Gary.config.action.mgrcmt.authRefusal + Gary.config.urlPattern,
	                	    params: {
	                	    	emails: ids,
	                	    	reasons: reasons || '审核不通过!'
	                	    },
	                	    success: function(response, opts) {
	                	    	mask.hide();
	                	    	var data = Gary.loadCheck(response);
	                	    	if(data){
	                	    		Ext.Msg.alert('提示',data.executeResult.resultMsg,function(){
	                	    			verifyFailWin.hide();
		    	    					grid.getStore().reload();
		    	    				});
	                	    	}
	                	    },
	                	    failure: function(response, opts) {
	                	    	Gary.loadCheck(response);
	                	    	mask.hide();
	                	    }
	                	});
		        	}
			    }
		    }]
		});
    	var authUsersStore = Gary.getStore({
        	model: 'MiddlewareAuthUser',
        	action: Gary.config.action.mgrcmt.authUserList,
        	root: 'data.list.items',
        	page: 'data.list.count'
        });
    	authUsersStore.on({
    		beforeload: function(store){
    			var records = grid.getSelectionModel().getSelection();
    			grid._selectRecords = records;
    		},
        	load: function(store, records, success){
        		if(success && grid._selectRecords && grid._selectRecords.length){
        			functiongrid.getStore().removeAll();
        			for ( var k = 0; k < grid._selectRecords.length; k++) {
        				for ( var j = 0; j < records.length; j++) {
        					if(grid._selectRecords[k].data.id == records[j].data.id){
        						var functions = records[j].raw.functions;
        						if(functions && functions.length){
        							for ( var i = functions.length; i > 0; i--) {
        		            			functiongrid.getStore().insert(0, Ext.create('MiddlewareFunction',functions[i-1]));
        							}
        						}
        					}
    					}
					}
        		}
	    	}
	    });
		var addAction = Ext.create('Ext.Action', {
	        text: '新增功能接入',
            iconCls: 'icon-btn-add',
            handler: function() {
            	var select = grid.getSelectionModel().getSelection();
            	if(select[0]){
            		functionWin.show();
                }
            },
            disabled: true
	    });
	    var verifyOkAction = Ext.create('Ext.Action', {
	        text: '审核通过',
            iconCls: 'icon-btn-modify',
            handler: function() {
            	var select = grid.getSelectionModel().getSelection();
	        	if(select[0]){
	        		var ids = [];
	        		for ( var i = 0; i < select.length; i++) {
	        			var authUser = select[i];
	        			ids.push(authUser.data.email);
					}
	        		Ext.Msg.confirm('警告!','你确定审核通过选中的接入用户吗?', function(btn){
	        			if(btn == 'yes'){
	        				Ext.Ajax.request({
					    	    url: Gary.config.base + Gary.config.action.mgrcmt.authAccept + Gary.config.urlPattern,    
					    	    params: {
					    	    	emails: ids
					    	    },
					    	    success: function(response, opts) {
					    	    	var data = Gary.loadCheck(response);
					    	    	if(data){
					    	    		Ext.Msg.alert('提示',data.executeResult.resultMsg,function(){
			    	    					grid.getStore().reload();
			    	    				});
					    	    	}
					    	    },
					    	    failure: function(response, opts) {
					    	    	Gary.loadCheck(response);
					    	    }
					    	});
	        			}
	        		});
	        	}
            },
            disabled: true
	    });
	    var verifyFailAction = Ext.create('Ext.Action', {
	        text: '审核拒绝',
            iconCls: 'icon-btn-setting',
            handler: function() {
            	var select = grid.getSelectionModel().getSelection();
            	if(select[0]){
            		ReasonsForRefusal.setValue('');
            		verifyFailWin.show();
            		ReasonsForRefusal.focus();
                }
            },
            disabled: true
	    });
	    var delAuthUserLinkFunction = Ext.create('Ext.Action', {
	        text: '取消接入功能',
            iconCls: 'icon-btn-setting',
            handler: function() {
            	var select = functiongrid.getSelectionModel().getSelection();
            	if(select[0]){
	        		Ext.Msg.confirm('警告!','你确定取消接入选中的功能吗?', function(btn){
	        			if(btn == 'yes'){
	        				mask.show();
	        				var ids = [];
	    	        		for ( var i = 0; i < select.length; i++) {
	    	        			ids.push(select[i].data.business);
	    					}
	    	        		Ext.Ajax.request({
	                    	    url: Gary.config.base + Gary.config.action.mgrcmt.authDelFunction + Gary.config.urlPattern,
	                    	    params: {
	                    	    	funs: ids,
	                    	    	authClientId: authClientId
	                    	    },
	                    	    success: function(response, opts) {
	                    	    	mask.hide();
	                    	    	var data = Gary.loadCheck(response);
	                    	    	if(data){
	                    	    		Ext.Msg.alert('提示',data.executeResult.resultMsg,function(){
	                    	    			functionWin.hide();
	                    	    			authFunctions = data.data.functions;
			    	    					grid.getStore().reload();
			    	    				});
	                    	    	}
	                    	    },
	                    	    failure: function(response, opts) {
	                    	    	Gary.loadCheck(response);
	                    	    	mask.hide();
	                    	    }
	                    	});
	        			}
	        		});
                }
            }
	    });
		
        var tabPanelEast = Ext.create('Ext.Gary.rtab.Panel',{
    		items: []
    	});
    	var menus = [addAction,verifyOkAction,verifyFailAction];
	    var menu = Ext.create('Ext.menu.Menu', {
		    items: menus
		});
	    var functionmenus = Ext.create('Ext.menu.Menu', {
	    	items: [delAuthUserLinkFunction]
	    });
    	var paging = Ext.create('Ext.Gary.toolbar.Paging',{
        	store: authUsersStore,
        	plugins: [new Ext.ux.ProgressBarPager(),new Ext.ux.SlidingPager()]
    	});
		var grid = Ext.create('Ext.Gary.grid.Panel', {
	       	store: authUsersStore,
	       	region : 'center',
	        width: '100%',
	        height: '100%',
	       	columns: [{
	            header: '用户名称',
	            dataIndex: 'userName'
	        },{
	            header: '公司名称',
	            dataIndex: 'companyName'
	        },{
	            header: '接入者类型',
	            dataIndex: 'type',
	            renderer: function(v){
	            	if('personal' == v)
	            		return '个人';
	            	else
	            		return '公司';
	            }
	        },{
	            header: '身份证号码',
	            dataIndex: 'idCard'
	        },{
	            header: '地址',
	            dataIndex: 'addrAll',
	            renderer : Gary.repMetadata
	        },{
	            header: '手机号码',
	            dataIndex: 'mobile'
	        },{
	            header: '公司电话',
	            dataIndex: 'companyTel'
	        },{
	            header: '邮箱地址',
	            dataIndex: 'email'
	        },{
	            header: '营业执照',
	            dataIndex: 'businessLicense'
	        },{
	            header: '状态',
	            dataIndex: 'state',
	            renderer: function(v){
	            	switch (v) {
					case 'email':
						v = '邮箱验证';
						break;
					case 'verify':
						v = '待审核';
						break;
					case 'close':
						v = '禁用';
					case 'accept':
						v = '正常';
						break;
					default:
						break;
					}
	            	return v;
	            }
	        },{
	            header: '主页',
	            dataIndex: 'mainUrl',
	            renderer : Gary.repMetadata
	        },{
	            header: '注册时间',
	            dataIndex: 'regDate',
	            width: 140
	        },{
	            header: '接入时间',
	            dataIndex: 'successDate',
	            width: 140
	        }],
            tbar: menus,
            bbar: paging,
            selModel: new Ext.selection.CheckboxModel(),
            listeners: {
            	itemclick: function(cmp, record, item, index){
            		authClientId = record.data.authClientId;
            		authFunctions = record.raw.functions;
            		if(record && record.raw.functions){
	            		var functions = record.raw.functions;
	            		functiongrid.getStore().removeAll();
	            		for ( var i = functions.length; i > 0; i--) {
	            			functiongrid.getStore().insert(0, Ext.create('MiddlewareFunction',functions[i-1]));
						}
	            		if(functiongrid.collapsed)
	            			functiongrid.expand();
	            	}
            	},
	            selectionchange: function(view, records) {
	            	addAction.setDisabled(!records.length);
	            	verifyOkAction.setDisabled(!records.length);
	            	verifyFailAction.setDisabled(!records.length);
	            },
	            itemcontextmenu: function(view,record,item,index,e){
	            	e.stopEvent();
                    menu.showAt(e.getXY());
                    return false;
	            }
            }
	    });
		var functiongrid = Ext.create('Ext.Gary.grid.Panel', {
			region : 'south',
	        split: true,
	        collapsible: true,
	    	collapsed: true,
	        width: '100%',
	        height: '50%',
	        title: '已接入的功能',
	        columns: [{
	       		header: '功能名称',
	            dataIndex: 'name',
	            renderer : Gary.repMetadata
	       	},{
	       		header: '功能编号',
	            dataIndex: 'business'
	       	},{
	       		header: '功能类型',
	            dataIndex: 'type',
	        	renderer: function(v){
	        		return v == 'login' ? '登录' : '业务';
	        	}
	       	},{
	       		header: '功能描述',
	            dataIndex: 'memo',
	            renderer : Gary.repMetadata
	       	}],
            selModel: new Ext.selection.CheckboxModel(),
            listeners: {
	            selectionchange: function(view, records) {
	            	delAuthUserLinkFunction.setDisabled(!records.length);
	            },
	            itemcontextmenu: function(view,record,item,index,e){
	            	e.stopEvent();
	            	functionmenus.showAt(e.getXY());
                    return false;
	            }
            }
	    });
		var gridPanel = Ext.create('Ext.panel.Panel', {
			region : 'center',
			layout:'border',
			width: '100%',
	        height: '100%',
	        items:[grid, functiongrid]
		});
		Ext.apply(this, { 
			items: [ 
		        gridPanel,tabPanelEast
			] 
		});
	    eval(Gary.config.com + '.AuthorizeUserMgr' + '.superclass.initComponent.apply(this, arguments)');
    }
});

