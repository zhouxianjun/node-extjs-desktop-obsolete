Ext.define(Gary.config.com + '.PlanManager', {  
    extend: 'Ext.panel.Panel',  
    title: '资费管理',
    closable : true,
    id: Gary.config.com + '.PlanManager',
    layout:'border',
    initComponent: function() {
    	var mask = new Ext.LoadMask(this, {msg:"Please wait..."});
    	var PlanStore = Gary.getStore({
        	model: 'Plan',
        	params: {
        		action: 'getTariffPlanList'
        	},
        	root: 'dataView.synergyTariffPlan',
        	page: 'pageView.rowCount'
        });
		var addAction = Ext.create('Ext.Action', {
	        text: '新增资费',
            iconCls: 'icon-btn-add',
            handler: function() {
	        	tabPanelEast.setActiveTab(add);
	        	if(tabPanelEast.collapsed)
	        		tabPanelEast.expand();
            }
	    });
	    var modifyAction = Ext.create('Ext.Action', {
	        text: '修改资费',
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
		var delAction = Ext.create('Ext.Action', {
	        text: '删除资费',
            iconCls: 'icon-btn-delete',
            handler: function() {
            	var select = grid.getSelectionModel().getSelection();
	        	if(select[0]){
	        		Ext.Msg.confirm('警告!','你确定删除 ' + select[0].get('planName') + ' 资费吗?',function(btn){
	        			if(btn=='yes'){
	        				Ext.Ajax.request({
					    	    url: Gary.config.base+'base',    
					    	    params: {
					    	        action: 'deleteTariffPlan',
					    	        planid: select[0].get('planId')
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
    		title: '修改资费',
    		items: [{
		        hidden: true,
		        name: 'planId'
		    },{
		        fieldLabel: '资费名称',
		        name: 'planName',
		        allowBlank:false,
		    },{
		    	xtype: 'numberfield',
		        fieldLabel: '短信费率',
		        allowBlank:false,
		        name: 'smsTariff'
		    },{
		    	xtype: 'numberfield',
		        fieldLabel: '传真费率',
		        allowBlank:false,
		        name: 'faxTariff'
		    },{
		    	xtype: 'combobox',
		    	queryMode: 'local',
		    	displayField: 'name',
		    	valueField: 'billingId',
		    	store: Gary.getStore({
		        	model: 'Billing',
		        	params: {
		        		action: 'getBillingList',
		        		billtype: 1
		        	},
		        	root: 'dataView.synergyBilling',
		        	page: 'pageView.rowCount'
		        }),
		        fieldLabel: '呼叫策略',
		        allowBlank:false,
		        name: 'cbBussId'
		    },{
		    	xtype: 'combobox',
		    	queryMode: 'local',
		    	displayField: 'name',
		    	valueField: 'billingId',
		    	store: Gary.getStore({
		        	model: 'Billing',
		        	params: {
		        		action: 'getBillingList',
		        		billtype: 2
		        	},
		        	root: 'dataView.synergyBilling',
		        	page: 'pageView.rowCount'
		        }),
		        fieldLabel: '会议策略',
		        allowBlank:false,
		        name: 'confBussId'
		    },{
		    	xtype: 'numberfield',
		        fieldLabel: 'PC音频费率',
		        allowBlank:false,
		        name: 'audioPCTariff'
		    },{
		    	xtype: 'numberfield',
		        fieldLabel: '音频会议免费方数',
		        allowBlank:false,
		        name: 'audioFreeConfs'
		    },{
		    	xtype: 'numberfield',
		        fieldLabel: '手机,固话呼入费率',
		        allowBlank:false,
		        name: 'confPSTNInTariff'
		    }],
		    onSubmit: function(){
		    	var form = this.getForm();
	            if (form.isValid()) {
	            	mask.show();
	                form.submit({
	                	params: {
		                	action: 'modifyTariffPlan'
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
    		title: '新增资费',
    		items: [{
		        fieldLabel: '资费名称',
		        name: 'planname',
		        allowBlank:false,
		    },{
		    	xtype: 'numberfield',
		        fieldLabel: '短信费率',
		        allowBlank:false,
		        name: 'smstariff'
		    },{
		    	xtype: 'numberfield',
		        fieldLabel: '传真费率',
		        allowBlank:false,
		        name: 'faxtariff'
		    },{
		    	xtype: 'combobox',
		    	queryMode: 'local',
		    	displayField: 'name',
		    	valueField: 'billingId',
		    	store: Gary.getStore({
		        	model: 'Billing',
		        	params: {
		        		action: 'getBillingList',
		        		billtype: 1
		        	},
		        	root: 'dataView.synergyBilling',
		        	page: 'pageView.rowCount'
		        }),
		        fieldLabel: '呼叫策略',
		        allowBlank:false,
		        name: 'cbbussid'
		    },{
		    	xtype: 'combobox',
		    	queryMode: 'local',
		    	displayField: 'name',
		    	valueField: 'billingId',
		    	store: Gary.getStore({
		        	model: 'Billing',
		        	params: {
		        		action: 'getBillingList',
		        		billtype: 2
		        	},
		        	root: 'dataView.synergyBilling',
		        	page: 'pageView.rowCount'
		        }),
		        fieldLabel: '会议策略',
		        allowBlank:false,
		        name: 'confbussid'
		    },{
		    	xtype: 'numberfield',
		        fieldLabel: 'PC音频费率',
		        allowBlank:false,
		        name: 'audioPCTariff'
		    },{
		    	xtype: 'numberfield',
		        fieldLabel: '音频会议免费方数',
		        allowBlank:false,
		        name: 'audiofreeconfs'
		    },{
		    	xtype: 'numberfield',
		        fieldLabel: '手机,固话呼入费率',
		        allowBlank:false,
		        name: 'confpstnintariff'
		    }],
		    onSubmit: function(){
		    	var form = this.getForm();
	            if (form.isValid()) {
	            	mask.show();
	                form.submit({
	                	params: {
		                	action: 'addTariffPlan'
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
    		items: [modify,add]
    	});
    	var menus = [addAction,modifyAction,delAction];
	    var menu = Ext.create('Ext.menu.Menu', {
		    items: menus
		});
    	var paging = Ext.create('Ext.Gary.toolbar.Paging',{
        	store: PlanStore
    	});
		var grid = Ext.create('Ext.Gary.grid.Panel', {
	       	store: PlanStore,
	       	columns: [{
	            header: '资费ID',
	            dataIndex: 'planId' 
	        }, {
	            header: '资费名称',
	            dataIndex: 'planName' 
	        }, {
	            header: '短信费率',
	            dataIndex: 'smsTariff',
	            renderer: function(v){
	            	return v + '元/条';
	            }
	        }, {
	            header: '传真费率',
	            dataIndex: 'faxTariff',
	            renderer: function(v){
	            	return v + '元/分钟';
	            }
	        }, {
	            header: '回拨策略',
	            dataIndex: 'cbBussName'
	        }, {
	            header: '会议策略',
	            dataIndex: 'confBussName'
	        }, {
	            header: 'PC音频费率',
	            dataIndex: 'audioPCTariff',
	            renderer: function(v){
	            	return v + '元/分钟';
	            }
	        }, {
	            header: '音频会议免费方数',
	            dataIndex: 'audioFreeConfs',
	            renderer: function(v){
	            	return v + '元/分钟/方';
	            }
	        }, {
	            header: '手机,固话呼入费率',
	            dataIndex: 'confPSTNInTariff',
	            renderer: function(v){
	            	return v + '元/分钟';
	            }
	        }, {
	            header: '状态',
	            dataIndex: 'state',
	            renderer: Gary.repVal
	        }, {
	            xtype: 'datecolumn',
	            header: '创建日期',
	            dataIndex: 'createTime',
	            format:'Y-m-d H:i:s',
	            width: 140
	        }],
            tbar: menus,
            bbar: paging,
            selModel: new Ext.selection.CheckboxModel({mode: 'single'}),
            listeners: {
	            selectionchange: function(view, records) {
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
	    eval(Gary.config.com + '.PlanManager' + '.superclass.initComponent.apply(this, arguments)');
    }
});