Ext.define(Gary.config.com + '.ConferBilling', {  
    extend: 'Ext.panel.Panel',  
    title: '会议策略',
    closable : true,
    id: Gary.config.com + '.ConferBilling',
    layout:'fit',
    initComponent: function() {
    	var billingid = 0; 
    	var mask = new Ext.LoadMask(this, {msg:"Please wait..."});
    	var BillingStore = Gary.getStore({
        	model: 'Billing',
        	params: {
        		action: 'getBillingList',
        		billtype: 2
        	},
        	root: 'dataView.synergyBilling',
        	page: 'pageView.rowCount'
        });
        var BillingInfoStore = Gary.getStore({
        	model: 'BillingInfo',
        	autoLoad: false,
        	params: {
        		action: 'getBillingTariffList'
        	},
        	root: 'dataView.synergyTariff',
        	page: 'pageView.rowCount'
        });
        var CallTypeStore = Gary.getStore({
        	model: 'EnumType',
        	params: {
        		action: 'getEnumList',
        		type: 'CallType'
        	},
        	root: 'dataView.synergyCallType.entity'
        });
		var addAction = Ext.create('Ext.Action', {
	        text: '新增会议策略',
            iconCls: 'icon-btn-add',
            handler: function() {
	        	Gary.doBilling(mask,2,grid,null,'addBilling');
            }
	    });
	    var modifyAction = Ext.create('Ext.Action', {
	        text: '修改会议策略',
            iconCls: 'icon-btn-modify',
            handler: function() {
            	var select = grid.getSelectionModel().getSelection();
	        	if(select[0]){
	        		Gary.doBilling(mask,2,grid,select[0],'modifyBilling');
	        	}
            },
            disabled: true
	    });
	    var viewAction = Ext.create('Ext.Action', {
	        text: '查看会议策略详细',
            iconCls: 'icon-btn-view',
            handler: function() {
            	var select = grid.getSelectionModel().getSelection();
	        	if(select[0]){
	        		var p = {billingid: select[0].get('billingId')};
	        		infopaging.queryStore = p;
	        		billingid = p.billingid;
	        		BillingInfoStore.load({params: p,callback: function(){
	        			if(infogrid.collapsed)
	            			infogrid.expand();
	        		}});
	        	}
            },
            disabled: true
	    });
	    var modifyByAddress = Ext.create('Ext.Action', {
	        text: '根据被叫地区修改通话资费',
            iconCls: 'icon-btn-modify',
            handler: function() {
            	var select = infogrid.getSelectionModel().getSelection();
            	if(select[0]){
            		Gary.doBillingInfo(mask,select[0],infogrid.getStore());
            	}
            },
            disabled: true
	    });
		var delAction = Ext.create('Ext.Action', {
	        text: '删除会议策略',
            iconCls: 'icon-btn-delete',
            handler: function() {
            	var select = grid.getSelectionModel().getSelection();
	        	if(select[0]){
	        		Ext.Msg.confirm('警告!','你确定删除 ' + select[0].get('name') + ' 策略吗?',function(btn){
	        			if(btn=='yes'){
	        				Ext.Ajax.request({
					    	    url: Gary.config.base+'base',    
					    	    params: {
					    	        action: 'deleteBilling',
					    	        billingId: select[0].get('billingId')
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
    	var menus = [addAction,viewAction,modifyAction,delAction];
	    var menu = Ext.create('Ext.menu.Menu', {
		    items: menus
		});
    	var paging = Ext.create('Ext.Gary.toolbar.Paging',{
        	store: BillingStore
    	});
    	var infopaging = Ext.create('Ext.Gary.toolbar.Paging',{
        	store: BillingInfoStore
    	});
		var grid = Ext.create('Ext.Gary.grid.Panel', {
	       	store: BillingStore,
	       	columns: [{
	        	hidden: true,
                text: "会议策略ID",
                dataIndex: 'billingId'
            },{
                text: "会议策略名称",
                dataIndex: 'name'
            },{
                text: "基础号码组",
                dataIndex: 'rootName'
            },{
                text: "策略类型",
                dataIndex: 'billTypeDescr'
            },{
                text: "描述",
                dataIndex: 'description'
            }],
            tbar: menus,
            bbar: paging,
            selModel: new Ext.selection.CheckboxModel({mode: 'single'}),
            listeners: {
	            selectionchange: function(view, records) {
	                viewAction.setDisabled(!records.length);
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
	    var queryTextCall = Ext.create('Ext.form.field.Text',{
			fieldLabel: '区号',
			labelWidth: 40,
			width: 100,
			vtype: 'alphanum',
		    name: 'calleehead'
		});
		var queryTextAddress = Ext.create('Ext.form.field.Text',{
			fieldLabel: '地址',
			labelWidth: 40,
			width: 150,
		    name: 'address'
		});
		var qyeryCallType = Ext.create('Ext.form.field.ComboBox',{
	    	fieldLabel: '通话类型',
	    	labelWidth: 60,
	    	queryMode: 'local',
	    	editable: false,
	    	width: 150,
	    	displayField: 'name',
		    valueField: 'id',
		    store: CallTypeStore,
		    name:'callType'
    	});
		var findAction = Ext.create('Ext.Action', {
	        text: '查询',
            iconCls: 'icon-btn-query',
            handler: function() {
            	var p = {billingId: billingid,calleehead: queryTextCall.getValue(),address: queryTextAddress.getValue(),callType: qyeryCallType.getValue()};
            	infopaging.queryStore = p;
            	BillingInfoStore.currentPage = 1;
                BillingInfoStore.load({params: p, callback: function(r,options,success ){
					if(infogrid.collapsed)
            			infogrid.expand();
            	}});
            }
	    });
		var clearAction = Ext.create('Ext.Action', {
	        text: '清空',
            iconCls: 'icon-btn-reset',
            handler: function() {
            	queryTextCall.reset();
            	queryTextAddress.reset();
            	qyeryCallType.reset();
            }
	    });
	    var infogrid = Ext.create('Ext.grid.Panel', {
	    	region : 'south',
	        split: true,
	        collapsible: true,
	    	collapsed: true,
	        width: '100%',
	        height: '50%',
	        title: '策略详细',
	        store: BillingInfoStore,
	        autoScroll: true,
	        columns: [{
	            header: '区号',
	            dataIndex: 'calleeHead'
	        },{
	            header: '通话类型',
	            dataIndex: 'callTypeDescr'
	        }, {
	            header: '点数',
	            dataIndex: 'tariffDescr'
	        }, {
	            header: '是否开通',
	            dataIndex: 'openFlag',
	            renderer: function(value){
		            switch(value){
						case 0:  return '否';
						case 1:  return '是';
					};
		        }
	        }, {
	            header: '计费方式(秒/次)',
	            dataIndex: 'normalTimeDescr'
	        }, {
	            header: '开始时长',
	            dataIndex: 'beginTime',
	            renderer: function(val){
	            	return val + '秒'
	            }
	        }, {
	            header: '开始次数',
	            dataIndex: 'beginCount',
	            renderer: function(val){
	            	return val + '次'
	            }
	        }, {
	            header: '倍率',
	            dataIndex: 'discount',
	            renderer: function(val){
	            	return val + '倍'
	            }
	        }, {
	            header: '地址',
	            dataIndex: 'address'
	        }],
	        tbar: [modifyByAddress,queryTextCall,queryTextAddress,qyeryCallType,findAction,clearAction],
	        selModel: new Ext.selection.CheckboxModel({mode: 'single'}),
            bbar: infopaging,
            listeners: {
	            selectionchange: function(view, records) {
	                modifyByAddress.setDisabled(!records.length);
	            }
            }
	    });
	    var gridPanel = Ext.create('Ext.panel.Panel', {
			region : 'center',
			layout:'border',
			width: '100%',
	        height: '100%',
	        items:[grid,infogrid]
		});
		Ext.apply(this, { 
			items: [ 
		        gridPanel
			] 
		});
	    eval(Gary.config.com + '.ConferBilling' + '.superclass.initComponent.apply(this, arguments)');
    }
});