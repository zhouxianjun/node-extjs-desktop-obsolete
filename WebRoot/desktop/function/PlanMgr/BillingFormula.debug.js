Ext.define(Gary.config.com + '.BillingFormula', {  
    extend: 'Ext.panel.Panel',  
    title: '计费公式管理',
    closable : true,
    id: Gary.config.com + '.BillingFormula',
    layout:'border',
    initComponent: function() {
    	var mask = new Ext.LoadMask(this, {msg:"Please wait..."});
    	var FormulaStore = Gary.getStore({
        	model: 'Formula',
        	params: {
        		action: 'getFormulaList',
        		type: 3
        	},
        	root: 'dataView.synergyFormula',
        	page: 'pageView.rowCount'
        });
        var queryAction = Ext.create('Ext.Action', {
	        text: '查询公式',
            iconCls: 'icon-btn-query',
            handler: function() {
	        	tabPanelEast.setActiveTab(query);
	        	if(tabPanelEast.collapsed)
	        		tabPanelEast.expand();
            }
	    });
		var addAction = Ext.create('Ext.Action', {
	        text: '新增公式',
            iconCls: 'icon-btn-add',
            handler: function() {
	        	tabPanelEast.setActiveTab(add);
	        	if(tabPanelEast.collapsed)
	        		tabPanelEast.expand();
            }
	    });
	    var modifyAction = Ext.create('Ext.Action', {
	        text: '修改公式',
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
	        text: '删除公式',
            iconCls: 'icon-btn-delete',
            handler: function() {
            	var select = grid.getSelectionModel().getSelection();
	        	if(select[0]){
	        		Ext.Msg.confirm('警告!','你确定删除 ' + select[0].get('memo') + ' 公式吗?',function(btn){
	        			if(btn=='yes'){
	        				Ext.Ajax.request({
					    	    url: Gary.config.base+'base',    
					    	    params: {
					    	        action: 'deleteFormula',
					    	        formulaid: select[0].get('formulaId')
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
    		title: '修改公式',
    		items: [{
    			xtype: 'numberfield',
		    	allowBlank:false,
		        fieldLabel: '起始时长',
		        name: 'beginTime'
		    },{
		    	xtype: 'numberfield',
		    	allowBlank:false,
		        fieldLabel: '起始次数',
		        name: 'beginCount'
		    },{
		    	xtype: 'numberfield',
		    	allowBlank:false,
		        fieldLabel: '正常时长',
		        name: 'normalTime'
		    },{
		    	xtype: 'numberfield',
		    	allowBlank:false,
		        fieldLabel: '正常次数',
		        name: 'normalCount'
		    },{
		    	xtype: 'numberfield',
		    	allowBlank:false,
		        fieldLabel: '费率',
		        name: 'tariff'
		    },{
		    	xtype: 'numberfield',
		    	allowBlank:false,
		        fieldLabel: '折扣',
		        name: 'discount'
		    },{
		    	xtype: 'numberfield',
		    	allowBlank:false,
		        fieldLabel: '优惠标识',
		        name: 'semiFlag'
		    },{
		    	allowBlank:false,
		        fieldLabel: '备注',
		        name: 'memo'
		    },{
    	        hidden: true,
    	        name: 'formulaId'
    	    }],
		    onSubmit: function(){
		    	var form = this.getForm();
	            if (form.isValid()) {
	            	mask.show();
	                form.submit({
	                	params: {
		                	action: 'modifyFormula'
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
    		title: '新增公式',
    		items: [{
    			xtype: 'numberfield',
		        fieldLabel: '起始时长',
		        allowBlank:false,
		        name: 'beginTime'
		    },{
		    	xtype: 'numberfield',
		    	allowBlank:false,
		        fieldLabel: '起始次数',
		        name: 'beginCount'
		    },{
		    	allowBlank:false,
		    	xtype: 'numberfield',
		        fieldLabel: '正常时长',
		        name: 'normalTime'
		    },{
		    	allowBlank:false,
		    	xtype: 'numberfield',
		        fieldLabel: '正常次数',
		        name: 'normalCount'
		    },{
		    	allowBlank:false,
		    	xtype: 'numberfield',
		        fieldLabel: '费率',
		        name: 'tariff'
		    },{
		    	allowBlank:false,
		    	xtype: 'numberfield',
		        fieldLabel: '折扣',
		        name: 'discount'
		    },{
		    	allowBlank:false,
		    	xtype: 'numberfield',
		        fieldLabel: '优惠标识',
		        name: 'semiFlag'
		    },{
		    	allowBlank:false,
		        fieldLabel: '备注',
		        name: 'memo'
		    }],
		    onSubmit: function(){
		    	var form = this.getForm();
	            if (form.isValid()) {
	            	mask.show();
	                form.submit({
	                	params: {
		                	action: 'addFormula'
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
    	var query = Ext.create('Ext.Gary.form.Panel', {
    		title: '查询公式',
    		items: [{
    			xtype: 'numberfield',
		        fieldLabel: '公式ID',
		        name: 'formulaId'
		    }],
		    onSubmit: function(){
		    	var form = this.getForm();
	            if (form.isValid()) {
	            	var params = Gary.deQureyParam(form);
	                grid.getStore().load({params: params});
	                paging.queryStore = params;
	            }
		    },
		    buttons: [{
		        text: '查询',
		        iconCls: 'icon-btn-query',
		        handler: function() {
			        query.onSubmit();
			    }
		    },{
		        text: '清空',
		        iconCls: 'icon-btn-reset',
		        handler: function() {
		        	query.getForm().reset();
			    }
		    }]
    	});
        var tabPanelEast = Ext.create('Ext.Gary.rtab.Panel',{
    		items: [modify,add,query]
    	});
    	var menus = [queryAction,addAction,modifyAction,delAction];
	    var menu = Ext.create('Ext.menu.Menu', {
		    items: menus
		});
    	var paging = Ext.create('Ext.Gary.toolbar.Paging',{
        	store: FormulaStore
    	});
		var grid = Ext.create('Ext.Gary.grid.Panel', {
	       	store: FormulaStore,
	       	columns: [{
	            header: '公式ID',
	            dataIndex: 'formulaId'
	        }, {
	            header: '起始时长',
	            dataIndex: 'beginTime'
	        }, {
	            header: '起始次数',
	            dataIndex: 'beginCount'
	        }, {
	            header: '正常时长',
	            dataIndex: 'normalTime'
	        }, {
	            header: '正常次数',
	            dataIndex: 'normalCount'
	        }, {
	            header: '费率',
	            dataIndex: 'tariff',
	            renderer: Gary.repMoney
	        }, {
	            header: '折扣',
	            dataIndex: 'discount',
	            renderer: function(v){
	            	return v + '倍';
	            }
	        }, {
	            header: '优惠标识',
	            dataIndex: 'semiFlag'
	        }, {
	            header: '备注',
	            dataIndex: 'memo'
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
	    eval(Gary.config.com + '.BillingFormula' + '.superclass.initComponent.apply(this, arguments)');
    }
});