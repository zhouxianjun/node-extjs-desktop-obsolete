Ext.define(Gary.config.com + '.SysMonitoring', {
    extend: 'Ext.Gary.desktop.Module',
    id: Gary.config.com + '.SysMonitoring',
    init : function(){
        this.launcher = {
            text: '系统监控'
        };
    },
	
    createCpuPanel: function(){
    	return this.cpuPanel = Ext.create('Ext.container.Container',{
            flex: 1,
            layout: {
                type: 'vbox',
                align: 'stretch'
            }
        });
    },
    createWindow : function(){
    	var me = this;
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow(Gary.config.com + '.SysMonitoring');
        if(!win){
            win = desktop.createWindow({
                id: Gary.config.com + '.SysMonitoring',
                isAddNavigation: false,
                isAddTabPanel: false,
                width: Ext.isIE ? 796 : '60%',
            	height: Ext.isIE ? 559 : '70%',
                layout: {
	                type: 'vbox',
	                align: 'stretch'    
	            },
                title:'系统监控',
                items: [me.cpuPanel = Ext.create('Ext.panel.Panel',{
                	height: 200,
		            titleAlign: 'center',
		            layout: {
		                type: 'hbox',
		                align: 'stretch'
		            }
		        }), me.memPanel = Ext.create('Ext.panel.Panel',{
		            flex: 1,
		            titleAlign: 'center',
		            layout: {
		                type: 'hbox',
		                align: 'stretch'
		            }
		        })],
	            loadData: function(data){
	            	var mewin = this;
	    	    	if(data){
	    	    		var cpusPerc = data.data.cpusPerc;
	    	    		var cpusInfo = data.data.cpusInfo[0];
	    	    		var mem = data.data.mem;
	    	    		var swap = data.data.swap;
	    	    		if(!mewin._n){
	    	    			me.cpuPanel.setTitle(cpusInfo.vendor + '(R) ' + cpusInfo.model + '(R) CPU ' + parseInt(cpusInfo.mhz) / 1000 + 'GHz');
	    	    			me.memPanel.setTitle(Gary.language.defaultLang.monitoring.mem.name + ': ' + Gary.language.defaultLang.monitoring.mem.total + ': ' + parseInt(mem.total / (1024 * 1024)) + 'M ' + Gary.language.defaultLang.monitoring.mem.swap.total + ': ' + parseInt(swap.total / (1024 * 1024)) + 'M');
	    	    			me.memPanel.add(me.mem = me.createMem([], 'mem'), me.swap = me.createMem([], 'swap'));
	    	    		}
	    	    		for (var i = 0; i < cpusPerc.length; i++) {
	    	    			var combined = parseFloat(cpusPerc[i].combined) * 100;
	    	    			if(!mewin._n){
	    	    				me.cpuPanel.add(me.createCpu(combined));
	    	    			}else{
	    	    				me.cpuPanel.items.items[i].getStore().loadData([{combined: combined}]);
	    	    			}
	    	    		}
	    	    		var memData = [{
	    	    			name: Gary.language.defaultLang.monitoring.mem.used,
	    	    			val: parseInt(mem.used / (1024 * 1024))
	    	    		},{
	    	    			name: Gary.language.defaultLang.monitoring.mem.free,
	    	    			val: parseInt(mem.free / (1024 * 1024))
	    	    		}];
	    	    		var swapData = [{
	    	    			name: Gary.language.defaultLang.monitoring.mem.swap.used,
	    	    			val: parseInt(swap.used / (1024 * 1024))
	    	    		},{
	    	    			name: Gary.language.defaultLang.monitoring.mem.swap.free,
	    	    			val: parseInt(swap.free / (1024 * 1024))
	    	    		}]
	    	    		me.mem.store.total = parseInt(mem.total / (1024 * 1024));
	    	    		me.swap.store.total = parseInt(swap.total / (1024 * 1024));
	    	    		me.mem.store.loadData(memData);
	    	    		me.swap.store.loadData(swapData);
	    	    		mewin._n = true;
	    	    	}
			    }
            });
        }
        return win;
    },
    createMem: function(data, type){
    	var me = this;
    	return {
            xtype: 'chart',
            style: 'background:#fff',
            animate: {
                easing: 'elasticIn',
                duration: 1000
            },
            store: Ext.create('Ext.data.JsonStore', {
		        fields: ['name', 'val'],
		        data: data
		    }),
            flex: 1,
            series: [{
                type: 'pie',
                field: 'val',
                showInLegend: true,
                donut: 10,
                colorSet: ['#FF0000', '#82B525'],
                tips: {
                  trackMouse: true,
                  width: 180,
                  height: 22,
                  _type: type, 
                  renderer: function(storeItem, item) {
                    var total = type == 'mem' ? me.mem.store.total : me.swap.store.total;
                    this.setTitle(storeItem.get('name') + ': ' + Math.round(storeItem.get('val') / total * 100) + '% ('+storeItem.get('val')+'M)');
                  }
                },
                highlight: {
                  segment: {
                    margin: 20
                  }
                },
                label: {
                    field: 'name',
                    display: 'rotate',
                    contrast: true,
                    font: '18px Arial'
                }
            }]
        };
    },
    createCpu: function(combined){
		return {
            xtype: 'chart',
            style: 'background:#fff',
            animate: {
                easing: 'elasticIn',
                duration: 1000
            },
            store: Ext.create('Ext.data.JsonStore', {
		        fields: ['combined'],
		        data: [{combined: combined}]
		    }),
            //insetPadding: 25,
            flex: 1,
            axes: [{
                type: 'gauge',
                position: 'gauge',
                minimum: 0,
                maximum: 100,
                steps: 10,
                margin: -10
            }],
            series: [{
                type: 'gauge',
                field: 'combined',
                donut: 30,
                colorSet: ['#82B525', '#ddd']
            }]
        };    
    }
});

