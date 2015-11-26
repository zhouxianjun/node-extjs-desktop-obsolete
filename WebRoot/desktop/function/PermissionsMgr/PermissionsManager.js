Ext.define(Gary.config.com + '.PermissionsManager', {  
    extend: 'Ext.panel.Panel',  
    title: '权限管理',
    closable : true,
    id: Gary.config.com + '.PermissionsManager',
    layout:'border',
    initComponent: function() {
    	var groupid = 0;
    	var mask = new Ext.LoadMask(this, {msg:"Please wait..."});
    	function checkTreeNode(node,checked){
			node.expand();
			node.eachChild(function(child) {
				child.set("checked", checked);
			 	if(child.hasChildNodes()){
			 		checkTreeNode(child,checked);
			 	}
			})
		}
    	var OpAuthGroupStore = Gary.getStore({
        	model: 'OpAuthGroup',
        	params: {
        		action: 'getOpAuthGroupList'
        	},
        	root: 'dataView.synergyOpAuthGroup',
        	page: 'pageView.rowCount'
        });
        var PermissionsStore = Ext.create('Ext.data.TreeStore', {
		   	model: 'Permissions',
		    proxy: {
		        type: 'ajax',
		        url: Gary.config.base+'base',
		        extraParams: {
		        	className: 'GetTreeAuthority', 
		        	action: 'getExtjsModularMenuItemList',
		        	showtype: 0,
		        	groupid: groupid
		        },
		        reader: {
		            type: 'json',
		            root: ''
		        },
		        listeners: {
	            	exception: Gary.loadError
	            }
		    }
		});
        var state = Ext.create('Ext.data.Store', {
			fields: ['name', 'value'],
			data : [
				{'name': '禁用', 'value': 0},
				{'name': '启用', 'value': 1}
			]
		});
		var setPanel = Ext.create('Ext.Gary.tree.Panel', {
			title: '设置权限',
	        store: PermissionsStore,
	        dockedItems: [{
	            xtype: 'toolbar',
	            items: {
	                text: '保存权限',
	                iconCls: 'icon-btn-accept',
	                handler: function(){
	                	mask.show();
	                    var records = setPanel.getView().getChecked();
	                    var names = [];
	                    var ids = [];
	                    Ext.Array.each(records, function(rec){
	                        names.push(rec.get('text'));
	                        var id = rec.get('methodId');
	                        if(id)
	                        	ids.push(id);
	                    });
	                    Ext.Ajax.request({
						    url: Gary.config.base+'base', 
						    params: {
						        action: 'setupGroupRight',
						        methodids: ids.join(','),
						        groupid: groupid
						    },
						    success: function(response, opts) {
						    	mask.hide();
						    	var data = Gary.loadCheck(response);
				    	    	if(data){
							    	Ext.Msg.alert('提示',data.executeResult.errorDescr);
				    	    	}
						    }, 
						    failure: function() { 
						    	mask.hide();
	                    		Gary.loadCheck(this.response);
						    }
						});
	                }
	            }
	        }],
	        listeners: {
	        	checkchange: function(node,checked){
	        		checkTreeNode(node,checked);
	        	}
	        }
	    });
		var addAction = Ext.create('Ext.Action', {
	        text: '新增权限组',
            iconCls: 'icon-btn-add',
            handler: function() {
	        	tabPanelEast.setActiveTab(add);
	        	if(tabPanelEast.collapsed)
	        		tabPanelEast.expand();
            }
	    });
	    var modifyAction = Ext.create('Ext.Action', {
	        text: '修改权限组',
            iconCls: 'icon-btn-modify',
            handler: function() {
            	var select = grid.getSelectionModel().getSelection();
	        	if(select[0]){
	        		modify.loadRecord(select[0]);
		        	tabPanelEast.setActiveTab(modify);
		        	if(tabPanelEast.collapsed)
		        		tabPanelEast.expand();
	        	}
            },
            disabled: true
	    });
	    var setAction = Ext.create('Ext.Action', {
	        text: '设置权限组',
            iconCls: 'icon-btn-setting',
            handler: function() {
            	var select = grid.getSelectionModel().getSelection();
            	if(select[0]){
            		groupid = select[0].get('groupId');
            		PermissionsStore.load({params:{groupid: groupid}});
            		tabPanelEast.setActiveTab(setPanel);
		        	if(tabPanelEast.collapsed)
		        		tabPanelEast.expand();
                }
            },
            disabled: true
	    });
		var delAction = Ext.create('Ext.Action', {
	        text: '删除权限组',
            iconCls: 'icon-btn-delete',
            handler: function() {
            	var select = grid.getSelectionModel().getSelection();
	        	if(select[0]){
	        		Ext.Msg.confirm('警告!','你确定删除 ' + select[0].get('groupName') + ' 权限组吗?',function(btn){
	        			if(btn=='yes'){
	        				Ext.Ajax.request({
					    	    url: Gary.config.base+'base',    
					    	    params: {
					    	        action: 'deleteOpAuthGroup',
					    	        groupid: select[0].get('groupId')
					    	    },
					    	    success: function(response, opts) {
					    	    	var data = Gary.loadCheck(response);
					    	    	if(data){
					    	    		Ext.Msg.alert('提示',data.executeResult.errorDescr,function(){
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
	    var modify = Ext.create('Ext.Gary.form.Panel', {
    		title: '修改权限组',
    		items: [{
		        hidden: true,
		        name: 'groupId'
		    },{
		        fieldLabel: '权限组名',
		        allowBlank:false,
				blankText: '不能为空!',
		        name: 'groupName'
		    },{
		        fieldLabel: '描述',
		        name: 'descr'
		    },{
		    	xtype: 'combobox',
		    	fieldLabel: '是否启用',
			    queryMode: 'local',
			    displayField: 'name',
			    valueField: 'value',
			    store: state,
			    name:'state'
	    	}],
		    onSubmit: function(){
		    	var form = this.getForm();
	            if (form.isValid()) {
	            	mask.show();
	                form.submit({
	                	params: {
		                	action: 'modifyOpAuthGroup'
			    	    },
	                    success: function(form, action) {
	                    	mask.hide();
	                       	var data = Gary.loadCheck(this.response);
	    	    			if(data){
	    	    				Ext.Msg.alert('提示',data.executeResult.errorDescr,function(){
	    	    					grid.getStore().reload();
	    	    				});
	    	    			}
	                    },
	                    failure: function(form, action) {
	                    	mask.hide();
	                    	Gary.loadCheck(this.response);
	                    }
	                });
	            }
		    },
		    buttons: [{
		        text: '修改',
		        iconCls: 'icon-btn-accept',
		        handler: function() {
			        modify.onSubmit();
			    }
		    },{
		        text: '清空',
		        iconCls: 'icon-btn-reset',
		        handler: function() {
		        	modify.getForm().reset();
			    }
		    }]
    	});
    	var add = Ext.create('Ext.Gary.form.Panel', {
    		title: '新增权限组',
    		items: [{
		        fieldLabel: '权限组名',
		        allowBlank: false,
		        name: 'groupName'
		    },{
		        fieldLabel: '描述',
		        name: 'descr'
		    }],
		    onSubmit: function(){
		    	var form = this.getForm();
	            if (form.isValid()) {
	            	mask.show();
	                form.submit({
	                	params: {
		                	action: 'addOpAuthGroup'
			    	    },
	                    success: function(form, action) {
	                    	mask.hide();
	                       	var data = Gary.loadCheck(this.response);
	    	    			if(data){
	    	    				Ext.Msg.alert('提示',data.executeResult.errorDescr,function(){
	    	    					grid.getStore().reload();
	    	    				});
	    	    			}
	                    },
	                    failure: function(form, action) {
	                    	mask.hide();
	                    	Gary.loadCheck(this.response);
	                    }
	                });
	            }
		    },
		    buttons: [{
		        text: '新增',
		        iconCls: 'icon-btn-accept',
		        handler: function() {
			        add.onSubmit();
			    }
		    },{
		        text: '清空',
		        iconCls: 'icon-btn-reset',
		        handler: function() {
		        	add.getForm().reset();
			    }
		    }]
    	});
        var tabPanelEast = Ext.create('Ext.Gary.rtab.Panel',{
    		items: [modify,add,setPanel]
    	});
    	var menus = [addAction,modifyAction,setAction,delAction];
	    var menu = Ext.create('Ext.menu.Menu', {
		    items: menus
		});
    	var paging = Ext.create('Ext.Gary.toolbar.Paging',{
        	store: OpAuthGroupStore
    	});
		var grid = Ext.create('Ext.Gary.grid.Panel', {
	       	store: OpAuthGroupStore,
	       	columns: [{
	            header: '权限组ID',
	            dataIndex: 'groupId'
	        },{
	            header: '权限组名',
	            dataIndex: 'groupName'
	        }, {
	            header: '描述',
	            dataIndex: 'descr',
	            renderer : Gary.repMetadata
	        }, {
	            header: '状态',
	            dataIndex: 'state',
	            renderer: function(value){
		            switch(value){
						case 0:  return '<span style="color:red;">禁用</span>';
						case 1:  return '<span style="color:green;">启用</span>';
					};
		        }
	        }],
            tbar: menus,
            bbar: paging,
            selModel: new Ext.selection.CheckboxModel({mode: 'single'}),
            listeners: {
	            selectionchange: function(view, records) {
	                setAction.setDisabled(!records.length);
	                modifyAction.setDisabled(!records.length);
	                addAction.setDisabled(!records.length);
	                delAction.setDisabled(!records.length);
	            },
	            itemcontextmenu: function(view,record,item,index,e){
	            	e.stopEvent();
                    menu.showAt(e.getXY());
                    return false;
	            }
            }
	    });
		Ext.apply(this, { 
			items: [ 
		        grid,tabPanelEast
			] 
		});
	    eval(Gary.config.com + '.PermissionsManager' + '.superclass.initComponent.apply(this, arguments)');
    }
});