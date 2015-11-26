Ext.define(Gary.config.com + '.FunctionList', {  
    extend: 'Ext.panel.Panel',  
    title: '功能列表',
    closable : true,
    id: Gary.config.com + '.FunctionList',
    layout:'border',
    initComponent: function() {
    	var mask = new Ext.LoadMask(this, {msg:"Please wait..."});
    	
    	var FunctionStore = Gary.getStore({
        	model: 'MiddlewareFunction',
        	action: Gary.config.action.mgrcmt.functionList,
        	root: 'data.list.items',
        	page: 'data.list.count'
        });
    	FunctionStore.on({
    		beforeload: function(store){
    			var records = grid.getSelectionModel().getSelection();
    			grid._selectRecords = records;
    		},
        	load: function(store, records, success){
        		if(success && grid._selectRecords && grid._selectRecords.length){
        			actiongrid.getStore().removeAll();
        			for ( var k = 0; k < grid._selectRecords.length; k++) {
        				for ( var j = 0; j < records.length; j++) {
        					if(grid._selectRecords[k].data.id == records[j].data.id){
        						var actions = records[j].raw.actions;
        						if(actions && actions.length){
        							for ( var i = actions.length; i > 0; i--) {
        		            			actions[i-1].functionId = records[j].data.id;
        		            			actiongrid.getStore().insert(0, Ext.create('MiddlewareAction',actions[i-1]));
        							}
        						}
        					}
    					}
					}
        		}
	    	}
	    });
    	
    	var addFunction = Ext.create('Ext.Action', {
	        text: '增加功能',
            iconCls: 'icon-btn-add',
            handler: function() {
            	grid.getPlugin('functionRowEditing').cancelEdit();
            	grid.getStore().insert(0, Ext.create('MiddlewareFunction',{}));
            	grid.getPlugin('functionRowEditing').startEdit(0,  0);
            }
	    });
    	var addAction = Ext.create('Ext.Action', {
	        text: '增加行为',
            iconCls: 'icon-btn-add',
            handler: function() {
            	var rec = grid.getSelectionModel().getSelection()[0];
            	if(rec){
            		actiongrid.getPlugin('actionRowEditing').cancelEdit();
                	actiongrid.getStore().insert(0, Ext.create('MiddlewareAction',{functionId: rec.raw.id}));
                	actiongrid.getPlugin('actionRowEditing').startEdit(0,  0);
            	}
            },
            disabled: true
	    });
    	var delFunction = Ext.create('Ext.Action', {
	        text: '删除功能',
            iconCls: 'icon-btn-delete',
            handler: function() {
            	var select = grid.getSelectionModel().getSelection();
	        	if(select[0]){
	        		var ids = [];
	        		for ( var i = 0; i < select.length; i++) {
	        			var fun = select[i];
	        			ids.push(fun.data.id);
					}
	        		Ext.Msg.confirm('警告!','你确定删除选中的功能吗?', function(btn){
	        			if(btn == 'yes'){
	        				Ext.Ajax.request({
					    	    url: Gary.config.base + Gary.config.action.mgrcmt.delFunction + Gary.config.urlPattern,    
					    	    params: {
					    	    	ids: ids
					    	    },
					    	    success: function(response, opts) {
					    	    	var data = Gary.loadCheck(response);
					    	    	if(data){
					    	    		Ext.Msg.alert('提示',data.executeResult.resultMsg,function(){
			    	    					grid.getStore().reload();
			    	    					actiongrid.getStore().removeAll()
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
    	var delFunctionLinkAction = Ext.create('Ext.Action', {
	        text: '删除功能行为',
            iconCls: 'icon-btn-delete',
            handler: function() {
            	var select = actiongrid.getSelectionModel().getSelection();
	        	if(select[0]){
	        		var ids = [];
	        		for ( var i = 0; i < select.length; i++) {
	        			var action = select[i];
	        			ids.push(action.data.id);
					}
	        		Ext.Msg.confirm('警告!','你确定删除选中的行为吗?', function(btn){
	        			if(btn == 'yes'){
	        				Ext.Ajax.request({
					    	    url: Gary.config.base + Gary.config.action.mgrcmt.delAction + Gary.config.urlPattern,    
					    	    params: {
					    	    	ids: ids
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
    	
        var tabPanelEast = Ext.create('Ext.Gary.rtab.Panel',{
    		items: []
    	});
    	var menus = [addFunction, addAction, delFunction];
	    var menu = Ext.create('Ext.menu.Menu', {
		    items: menus
		});
	    
	    var actionmenu = Ext.create('Ext.menu.Menu', {
	    	items: [delFunctionLinkAction]
	    });
	    
	    var paging = Ext.create('Ext.Gary.toolbar.Paging',{
        	store: FunctionStore,
        	plugins: [new Ext.ux.ProgressBarPager(),new Ext.ux.SlidingPager()]
    	});
	    
		var grid = Ext.create('Ext.Gary.grid.Panel', {
			region : 'center',
	        width: '100%',
	        height: '100%',
	       	columns: [{
	       		header: '功能名称',
	            dataIndex: 'name',
	            editor: {
	            	allowBlank: false,
	                xtype: 'textfield'
	            },
	            renderer : Gary.repMetadata
	       	},{
	       		header: '功能编号',
	       		editor: {
	       			allowBlank: false,
	                xtype: 'textfield'
	            },
	            dataIndex: 'business'
	       	},{
	       		header: '功能类型',
	            dataIndex: 'type',
	            editor: Ext.create('Ext.form.ComboBox', {
	                editable : false,
	        	    store: Ext.create('Ext.data.Store', {
	        	        fields: ['name', 'value'],
	        	        data : [
	        	            {"name":"登录", "value":"login"},
	        	            {"name":"业务", "value":"business"}
	        	        ]
	        	    }),
	        	    name: 'type',
	        	    queryMode: 'local',
	        	    displayField: 'name',
	        	    valueField: 'value',
	        	    allowBlank: false,
	        	    listeners: {
	        	    	change: function(cmp, newv, oldv){
	        	    		var open = Ext.getCmp('middleware_session_open');
	        	    		if('business' == newv){
	        	    			open.setValue(false);
	        	    		}
	        	    	}
	        	    }
	        	}),
	        	renderer: function(v){
	        		return v == 'login' ? '登录' : '业务';
	        	}
	       	},{
	       		header: '维持会话',
	            dataIndex: 'session_open',
	            xtype: 'booleancolumn',
	            trueText: '是',
	            falseText: '否', 
	            editor: Ext.create('Ext.form.ComboBox', {
	                editable : false,
	                id: 'middleware_session_open',
	        	    store: Ext.create('Ext.data.Store', {
	        	        fields: ['name', 'value'],
	        	        data : [
	        	            {"name":"是", "value": true},
	        	            {"name":"否", "value": false}
	        	        ]
	        	    }),
	        	    name: 'session_open',
	        	    queryMode: 'local',
	        	    displayField: 'name',
	        	    valueField: 'value',
	        	    allowBlank: false,
	        	    listeners: {
	        	    	change: function(cmp, newv, oldv){
	        	    		var webSessionTime = Ext.getCmp('middleware_session_webSessionTime');
	        	    		var webSessionUrl = Ext.getCmp('middleware_session_webSessionUrl');
	        	    		var webSessionMaxTime = Ext.getCmp('middleware_session_webSessionMaxTime');
	        	    		if(newv){
	        	    			webSessionTime.minValue = 10;
	        	    			webSessionMaxTime.minValue = 180;
	        	    		}else{
	        	    			webSessionTime.minValue = 0;
	        	    			webSessionMaxTime.minValue = 0;
	        	    		}
	        	    		webSessionUrl.allowBlank = !newv;
	        	    		webSessionTime.allowBlank = !newv;
	        	    		webSessionMaxTime.allowBlank = !newv;
	        	    	}
	        	    }
	        	})
	       	},{
	       		header: '会话URL',
	            dataIndex: 'session_webSessionUrl',
	            editor: {
	                xtype: 'textfield',
	                id: 'middleware_session_webSessionUrl'
	            },
	            renderer : Gary.repMetadata
	       	},{
	       		header: '会话标识',
	            dataIndex: 'session_userKey',
	            editor: {
	                xtype: 'textfield',
	                id: 'middleware_session_userKey'
	            },
	            renderer : Gary.repMetadata
	       	},{
	       		header: '会话更新',
	       		xtype: 'numbercolumn',
	            dataIndex: 'session_webSessionTime',
	            editor: {
	            	xtype: 'numberfield',
	                name: 'session_webSessionTime',
	                value: 60,
	                maxValue: 9999,
	                id: 'middleware_session_webSessionTime'
	            },
	            renderer: function(v){
	            	return v + '秒';
	            }
	       	},{
	       		header: '会话超时',
	       		xtype: 'numbercolumn',
	            dataIndex: 'session_webSessionMaxTime',
	            editor: {
	            	xtype: 'numberfield',
	                name: 'session_webSessionMaxTime',
	                value: 1800,
	                maxValue: 9999,
	                id: 'middleware_session_webSessionMaxTime'
	            },
	            renderer: function(v){
	            	return v + '秒';
	            }
	       	},{
	       		header: '单例登录',
	            dataIndex: 'session_single',
	            xtype: 'booleancolumn',
	            trueText: '是',
	            falseText: '否', 
	            editor: Ext.create('Ext.form.ComboBox', {
	                editable : false,
	        	    store: Ext.create('Ext.data.Store', {
	        	        fields: ['name', 'value'],
	        	        data : [
	        	            {"name":"是", "value": true},
	        	            {"name":"否", "value": false}
	        	        ]
	        	    }),
	        	    name: 'session_single',
	        	    queryMode: 'local',
	        	    displayField: 'name',
	        	    valueField: 'value',
	        	    allowBlank: false
	        	})
	       	},{
	       		header: '退出URL',
	            dataIndex: 'session_logoutUrl',
	            editor: {
	                xtype: 'textfield'
	            },
	            renderer : Gary.repMetadata
	       	},{
	       		header: '会话验证',
	            dataIndex: 'session_validate',
	            editor: {
	                xtype: 'textfield'
	            },
	            renderer : Gary.repMetadata
	       	},{
	       		header: '功能描述',
	            dataIndex: 'memo',
	            editor: {
	                xtype: 'textfield'
	            },
	            renderer : Gary.repMetadata
	       	}],
            tbar: menus,
            bbar: paging,
            store: FunctionStore,
            selModel: new Ext.selection.CheckboxModel({mode: 'single'}),
            plugins: [
                Ext.create('Ext.grid.plugin.RowEditing', {
                	clicksToEdit: 2,
                	autoCancel: false,
                	saveBtnText: '保存', 
                    cancelBtnText: '取消',
                    pluginId: 'functionRowEditing',
                    listeners: {
                    	edit: function(editor, e, eOpts){
                    		var formData = e.record.getData();
                    		Ext.Ajax.request({
                        	    url: Gary.config.base + Gary.config.action.mgrcmt.saveOrUpdateFunction + Gary.config.urlPattern,
                        	    params: {
                        	    	'function.id': formData.id,
                        	    	'function.name': formData.name,
                        	    	'function.business': formData.business,
                        	    	'function.memo': formData.memo,
                        	    	'function.type': formData.type,
                        	    	'function.session.open': formData.session_open,
                        	    	'function.session.webSessionUrl': formData.session_webSessionUrl,
                        	    	'function.session.webSessionTime': formData.session_webSessionTime,
                        	    	'function.session.webSessionMaxTime': formData.session_webSessionMaxTime,
                        	    	'function.session.single': formData.session_single,
                        	    	'function.session.userKey': formData.session_userKey,
                        	    	'function.session.logoutUrl': formData.session_logoutUrl,
                        	    	'function.session.validate': formData.session_validate
                        	    },
                        	    success: function(response, opts) {
                        	    	var data = Gary.loadCheck(response);
                        	    	if(data){
                        	    		e.record.commit();
                        	    		Ext.Msg.alert('提示',data.executeResult.resultMsg,function(){
			    	    					grid.getStore().reload();
			    	    				});
                        	    	}else{
                        	    		grid.getPlugin('functionRowEditing').startEdit(0,  0);
                        	    	}
                        	    },
                        	    failure: function(response, opts) {
                        	    	Gary.loadCheck(response);
                        	    	grid.getPlugin('functionRowEditing').startEdit(0,  0);
                        	    }
                        	});
                    	},
                    	canceledit: function(editor, context, eOpts){
                    		if(!context.record.data.id)
                    			grid.getStore().removeAt(0);
                    	}
                    }
                })
            ],
            listeners: {
	            selectionchange: function(view, records) {
	            	addAction.setDisabled(!records.length);
	            	delFunction.setDisabled(!records.length);
	            	var rec = grid.getSelectionModel().getSelection()[0];
	            	if(rec && rec.raw.actions){
	            		var actions = rec.raw.actions;
	            		actiongrid.getStore().removeAll();
	            		for ( var i = actions.length; i > 0; i--) {
	            			actions[i-1].functionId = rec.raw.id;
	            			actiongrid.getStore().insert(0, Ext.create('MiddlewareAction',actions[i-1]));
						}
	            		if(actiongrid.collapsed)
            				actiongrid.expand();
	            	}
	            },
	            itemcontextmenu: function(view,record,item,index,e){
	            	e.stopEvent();
                    menu.showAt(e.getXY());
                    return false;
	            }
            }
	    });
		var actiongrid = Ext.create('Ext.Gary.grid.Panel', {
			region : 'south',
	        split: true,
	        collapsible: true,
	    	collapsed: true,
	        width: '100%',
	        height: '50%',
	        title: '功能行为',
	       	columns: [{
	            header: '行为名称',
	            dataIndex: 'name',
	            editor: {
	                xtype: 'textfield',
	                allowBlank: false
	            },
	            renderer : Gary.repMetadata
	        },{
	            header: '行为优先级',
	            editor: {
	            	xtype: 'numberfield',
	                name: 'level',
	                maxValue: 10,
	                minValue: 1,
	                allowBlank: false
	            },
	            dataIndex: 'level'
	        },{
	            header: '行为组件',
	            editor: Ext.create('Ext.form.ComboBox', {
	                editable : false,
	        	    store: Gary.getStore({
	                	model: 'MiddlewareComponentMethod',
	                	action: Gary.config.action.mgrcmt.methodList,
	                	root: 'data.list'
	                }),
	        	    name: 'method',
	        	    queryMode: 'local',
	        	    displayField: 'name',
	        	    valueField: 'name',
	        	    allowBlank: false
	        	}),
	        	width: 250,
	            dataIndex: 'method',
	            renderer : Gary.repMetadata
	        },{
	            header: '行为路径',
	            dataIndex: 'path',
	            editor: {
	                xtype: 'textfield'
	            },
	            renderer : Gary.repMetadata
	        },{
	            header: '行为请求方式',
	            editor: Ext.create('Ext.form.ComboBox', {
	                editable : false,
	        	    store: Ext.create('Ext.data.Store', {
	        	        fields: ['name', 'value'],
	        	        data : [
	        	            {"name":"GET", "value": 'GET'},
	        	            {"name":"POST", "value": 'POST'}
	        	        ]
	        	    }),
	        	    name: 'httpMethod',
	        	    queryMode: 'local',
	        	    displayField: 'name',
	        	    valueField: 'value'
	        	}),
	            dataIndex: 'httpMethod'
	        },{
	            header: '行为编码',
	            editor: {
	                xtype: 'textfield'
	            },
	            dataIndex: 'coding'
	        },{
	            header: '返回数据',
	            dataIndex: 'returnData',
	            renderer: function(value){
	            	return (value == 'true' || value == true) ? '<span style="color:green;">是</span>' : '<span style="color:red;">否</span>';
		        },
		        editor: Ext.create('Ext.form.ComboBox', {
	                editable : false,
	        	    store: Ext.create('Ext.data.Store', {
	        	        fields: ['name', 'value'],
	        	        data : [
	        	            {"name":"是", "value": true},
	        	            {"name":"否", "value": false}
	        	        ]
	        	    }),
	        	    name: 'returnData',
	        	    queryMode: 'local',
	        	    displayField: 'name',
	        	    valueField: 'value',
	        	    allowBlank: false
	        	})
	        },{
	            header: '行为描述',
	            dataIndex: 'memo',
	            editor: {
	                xtype: 'textfield'
	            },
	            renderer : Gary.repMetadata
	        }],
            selModel: new Ext.selection.CheckboxModel(),
            plugins: [
				Ext.create('Ext.grid.plugin.RowEditing', {
				  	clicksToEdit: 2,
				  	autoCancel: false,
				  	saveBtnText: '保存', 
				      cancelBtnText: '取消',
				      pluginId: 'actionRowEditing',
				      listeners: {
				      	edit: function(editor, e, eOpts){
				      		var formData = e.record.getData();
				      		Ext.Ajax.request({
				          	    url: Gary.config.base + Gary.config.action.mgrcmt.saveOrUpdateAction + Gary.config.urlPattern,
				          	    params: {
				          	    	'action.name': formData.name,
				          	    	'action.coding': formData.coding,
				          	    	'action.memo': formData.memo,
				          	    	'action.httpMethod': formData.httpMethod,
				          	    	'action.id': formData.id,
				          	    	'action.level': formData.level,
				          	    	'action.method': formData.method,
				          	    	'action.path': formData.path,
				          	    	'action.returnData': formData.returnData,
				          	    	'action.function.id': formData.functionId
				          	    },
				          	    success: function(response, opts) {
				          	    	var data = Gary.loadCheck(response);
				          	    	if(data){
				          	    		e.record.commit();
				          	    		Ext.Msg.alert('提示',data.executeResult.resultMsg,function(){
			    	    					grid.getStore().reload();
			    	    				});
				          	    	}else{
				          	    		actiongrid.getPlugin('actionRowEditing').startEdit(0,  0);
				          	    	}
				          	    },
				          	    failure: function(response, opts) {
				          	    	Gary.loadCheck(response);
				          	    	actiongrid.getPlugin('actionRowEditing').startEdit(0,  0);
				          	    }
				          	});
				      	},
				      	canceledit: function(editor, context, eOpts){
				      		if(!context.record.data.id)
				      			actiongrid.getStore().removeAt(0);
				      	}
				      }
				  })
	        ],
            listeners: {
	            selectionchange: function(view, records) {
	            	delFunctionLinkAction.setDisabled(!records.length);
	            },
	            itemcontextmenu: function(view,record,item,index,e){
	            	e.stopEvent();
	            	actionmenu.showAt(e.getXY());
                    return false;
	            }
            }
	    });
		var gridPanel = Ext.create('Ext.panel.Panel', {
			region : 'center',
			layout:'border',
			width: '100%',
	        height: '100%',
	        items:[grid, actiongrid]
		});
		Ext.apply(this, { 
			items: [ 
		        gridPanel,tabPanelEast
			] 
		});
	    eval(Gary.config.com + '.FunctionList' + '.superclass.initComponent.apply(this, arguments)');
    }
});

