var tip;
var Gary = {
	language: {
		defaultLang: {}
	},
	isNodejs: true,
	system: true,
	config: {
		base: '/',
		fn_path: '/ext/desktop/function/',
		model_path: '/desktop/model/',
		com: 'Gary',
		page_size: 20,
		urlPattern: '',
		debug: false,
		action: {
			roleStore: 'role/list',
			addModular: 'modular/addModular',
			updateModular: 'modular/updateModular',
			deleteModular: 'modular/deleteModular',
			generateModular: 'modular/generateModular',
			addFunction: 'function/addFunction',
			modularFilesStore: 'modular/modularFiles',
			functionFilesStore: 'function/functionFiles',
			deleteFunction: 'function/deleteFunction',
			deleteRole: 'role/deleteRole',
			updateRole: 'role/updateRole',
			addRole: 'role/addRole',
			allAuth: 'function/allAuth',
			set: 'function/setAuth',
			functions: 'function/list',
			modulars: 'modular/list',
			allModulars: 'modular/all',
			logout: '',
			initNodejsSocket: 'ext/auth/addConnection',
			isLogin: 'admin/isLogin',
			sysMonitoring: 'ext/auth/sysDynamic'
		}
	},
	define: function(id,config,opt){
		if(config.extend)config.extend = Gary.config.com + '.' + config.extend;
		Ext.define(Gary.config.com + '.' + id, config, opt);
	},
	create: function(id,config,opt){
		if(config.extend)config.extend = Gary.config.com + '.' + config.extend;
		if(config.model)config.model = Gary.config.com + '.' + config.model;
		if(id.indexOf('Ext.') == 0){
			return Ext.create(id, config, opt);
		}else{
			return Ext.create(Gary.config.com + '.' + id, config, opt);
		}
	},
	getFolder: function(a){
		return a.substring(Gary.config.com.length + 1);
	},
	getFile: function(a){
		return a + '.js';
	},
	addTabPanel: function(tab,id,data){
		var cmp = tab.getComponent(id);
		if (cmp) {
			tab.setActiveTab(cmp);
			return;
		}
		cmp = Ext.create(id,{data: data});
		tab.add(cmp);
		tab.setActiveTab(cmp);
		tab.doLayout();
	},
	deQureyParam: function(form){
		var f = form.getFields();
	  	var values = form.getValues();
	  	var p = '{';
	  	f.each(function(item, index, length){
	  		var value = eval('values.'+item.name);
	  		if(value && value != 'null' || value == 0){
		  		value = '\''+ (value || value == 0 ? value : '') +'\'';
		  		p = p + item.name + ':' + value + ',';
	  		}
	  	})
	  	if(p == '{'){
	  		p = p + '}';
	  	}else{
	  		p = p.substring(0,p.length-1) + '}';
	  	}
	  	p = Ext.decode(p);
	  	return p;
	},
	generateQueryParam: function(obj){
		var html = '';
		for(var key in obj){
			html += '<input name="'+key+'" value="'+obj[key]+'"/>';
		}
		return html;
	},
	getUrlParam: function(param){
		var params = Ext.urlDecode(location.search.substring(1));
		return param ? params[param] : params;
	},
	deParams: function(o){
		var re = '';
		for(var key in o){
			re += key + '=' + o[key] + '&';
		}
		return re.length <= 0 ? re : re.substring(0,re.length - 1);
	},
	checkChildTree: function(node,checked){
		node.expand();
		node.eachChild(function(child) {
			child.set("checked", checked);
		 	if(child.hasChildNodes()){
		 		checkTreeNode(child,checked);
		 	}
		})
	},
	hideAllWin: function(){
		Gary.desktop.windows.each(function(win){
			Gary.desktop.minimizeWindow(win);
		});
	},
	loadCheck: function(data, callback){
		if((data.status && data.status != 200) || !data.responseText){
			Ext.Msg.alert(Gary.language.defaultLang.error.error, Gary.language.defaultLang.error.connectionServer, callback);
			return false;
		}
		data = Ext.decode(data.responseText);
		return this.exceptionHandle(data, callback);
	},
	exceptionHandle: function(data, callback){
		if(data.success == false){
			if(data.executeResult.result == 999){
				setTimeout(function(){
					Ext.Msg.alert(Gary.language.defaultLang.error.error,Gary.language.defaultLang.error.relogin,function(){
						window.location.reload();
						if(callback){
							callback();
						}
					});
				}, 300);
			}else if(data.executeResult.result == 400){
				if(data.data.requestParameter){
					setTimeout(function(){
						var msg = '缺少参数:[' + data.data.requestParameter.name + ']<br>类型: '+ data.data.requestParameter.type +'<br>错误信息: ' + data.data.requestParameter.errorMsg;
						Ext.Msg.alert(Gary.language.defaultLang.error.error + Gary.language.defaultLang.error.errorCode + data.executeResult.result, msg, callback);
					}, 300);
				}else{
					setTimeout(function(){
						var msg = '';
						for ( var v in data.data.validation) {
							msg += '参数:[' + data.data.validation[v].name + '] + ' + data.data.validation[v].errorMsg + '<br>';
						}
						Ext.Msg.alert(Gary.language.defaultLang.error.error + Gary.language.defaultLang.error.errorCode + data.executeResult.result, msg, callback);
					}, 300);
				}
			}else{
				setTimeout(function(){
					Ext.Msg.alert(Gary.language.defaultLang.error.error + Gary.language.defaultLang.error.errorCode + data.executeResult.result, data.msg || data.executeResult.resultMsg, callback);
				}, 300);
			}
			return false;
		}else{
			return data;
		}
	},
	loadError: function(proxy,res,oper, callback){
		if(res && res.status && res.status != 200){
			Ext.Msg.alert(res.status + '',res.statusText, callback);
		}else{
			var exec = proxy.reader.jsonData.executeResult;
			this.exceptionHandle(proxy.reader.jsonData, callback);
		}
	},
	getStore: function(opt){
		opt = opt || {};
		opt.params = opt.params || {};
		if(opt.params && !opt.params.pageSize){
			opt.params.pageSize = opt.pageSize || Gary.config.page_size;
		}
		return Ext.create('Ext.data.Store', {
		    pageSize: opt.pageSize || Gary.config.page_size,
		    model: opt.model,
		    autoLoad: opt.autoLoad!=false?true:false,
		    proxy: {
		        type: opt.type || 'ajax',
		        extraParams: opt.params,
		        url: opt.url || Gary.config.base + opt.action + Gary.config.urlPattern,
		        reader: {
		            type: 'json',
		            root: opt.root || '',
		            totalProperty: opt.page
		        },
		        listeners: {
	            	exception: function(proxy,res,oper){
	            		if(opt.exception){
	            			if(opt.exception(proxy,res,oper)){
	            				Gary.loadError(proxy,res,oper);
	            			}
	            		}else{
	            			Gary.loadError(proxy,res,oper);
	            		}
	            	}
	            }
		    }
		});
	},
	repVal: function(v){
		switch(v){
			case 'ST000': return '<span style="color:gray;">'+Gary.language.defaultLang.state.ST000+'</span>';
			case 'ST001': return '<span style="color:gray;">'+Gary.language.defaultLang.state.ST001+'</span>';
			case 'ST002': return '<span style="color:green;">'+Gary.language.defaultLang.state.ST002+'</span>';
			case 'ST003': return '<span style="color:red;">'+Gary.language.defaultLang.state.ST003+'</span>';
			case 'ST004': return '<span style="color:red;">'+Gary.language.defaultLang.state.ST004+'</span>';
			case 'ST017': return '<span style="color:red;">'+Gary.language.defaultLang.state.ST0017+'</span>';
		};
	},
	repMoney: function(v){
		return v + '元';
	},
	repMetadata: function(value, metadata, record){
		metadata.tdAttr = 'data-qtip='+ value;
        return value;
	},
	mousePos: function(event){
		var x,y;
		var e = e||window.event;
		return {
			x:e.clientX+document.body.scrollLeft+document.documentElement.scrollLeft,
			y:e.clientY+document.body.scrollTop+document.documentElement.scrollTop
		};
	},
	initDesktop: function(user, callback){
		Ext.Ajax.request({
    	    url: Gary.config.base + Gary.config.action.modulars + Gary.config.urlPattern,    
    	    success: function(response, opts) {
    	    	var data = Gary.loadCheck(response);
    	    	if(data){
    		    	var jses = [];
    		    	var modulars = data.data.modulars;
    		    	var modules = [];
    		    	for(var i = 0; i < modulars.length; i++){
    		    		var module = Gary.config.com + '.' + modulars[i].modularIdentifer;
    		    		jses[i] = {
    	    				js: Gary.config.model_path + module + '.js',
    	    				id: 'js.' + modulars[i].modularIdentifer
    	    			}
    		    		modules.push(module);
    		    	}
    		    	Gary.JsLoader.loads(jses,function(){
    		    		App = new Ext.Gary.App({
    			        	modules: modules,
    			        	user: user
    			        });
    			        App.initShortcut();
    			        if(callback){
    			        	callback();
    			        }
    		    	});
    	    	}
    	    },
    	    failure: function(response, opts) {
    	    	Gary.loadCheck(response);
    	    }
    	});
	},
	initNodejsSoket: function(){
		if(Gary.isNodejs && !Gary.nodejs.isConnect){
			var socket = Gary.nodejs.connect({
				//url: 'http://' + Gary.nodejs.ip + ':' + Gary.nodejs.port,
				events: Gary.nodejs.events
			});
		}
	},
	showMsg: function(msg, title){
		Ext.create('widget.uxNotification', {
			title: title || 'Msg',
			useXAxis: true,
			position: 'tr',
			//cls: 'ux-notification-light',
			iconCls: 'ux-notification-icon-information',
			html: msg,
			width: 200,
			maxHeight: 200,
			resizable: false,
			autoCloseDelay: 4000,
			slideBackDuration: 500,
			slideInAnimation: 'bounceOut',
			slideBackAnimation: 'easeIn'
		}).show();
	},
	showInfo: function(msg, title){
		Ext.create('widget.uxNotification', {
			title: title || 'Info',
			position: 'br',
			closable: false,
			resizable: false,
			html: msg,
			maxWidth: 200,
			maxHeight: 100,
			slideInAnimation: 'bounceOut',
			slideBackAnimation: 'easeIn'
		}).show();
	},
	Gzip: {
		load: function(opt){
			var scriptId = document.getElementById('gzip-js-' + opt.id);
		    if(scriptId){
		        if(opt.callback){
		        	opt.callback();
		        }
		    }else{
				Ext.Ajax.request({
					url: Gary.config.base + 'gzip/load' + Gary.config.urlPattern,
					params: {
						files: opt.files
					},
					success: function(response,opts){
						var msg = response.responseText;
						var json = Ext.JSON.decode(msg, true);
						if(json){
							Gary.exceptionHandle(json);
						}else{
							if(opt.type && opt.type == 'source'){
			    				var script = document.createElement("script");
						        script.id = 'gzip-js-' + opt.id;
						        script.type = "text/javascript";
						        script.text = msg;
						        var head = document.getElementsByTagName('head').item(0);
						        head.appendChild (script);
						        if(opt.callback){
						        	opt.callback(msg);
						        }
			    			}else{
			    				msg = msg.split(',');
			    				var loaderNumber = 0;
			    				var loadCount = msg.length;
			    				if(opt.sort == true){
				    				function _load(){
				    					var script = document.createElement("script");
								        script.id = 'gzip-js-' + opt.id + '-' + loaderNumber;
								        script.type = "text/javascript";
								        script.src = msg[loaderNumber];
								        script.onload = script.onreadystatechange = function(){
								            if (script.readyState && script.readyState != 'loaded' && script.readyState != 'complete'){
								                return;
								            }
								            script.onreadystatechange = script.onload = null;
								            loaderNumber+=1;
								            if (loaderNumber >= loadCount){
								            	if(opt.callback){
										        	opt.callback(msg);
										        }
								            }else{
										    	_load();
								            }
								        };
								        var head = document.getElementsByTagName('head').item(0);
								        head.appendChild (script);
				    				}
				    				_load();
			    				}else{
			    					for(var i = 0; i < msg.length; i++){
				    					var script = document.createElement("script");
								        script.id = 'gzip-js-' + opt.id + '-' + i;
								        script.type = "text/javascript";
								        script.src = msg[i];
								        script.onload = script.onreadystatechange = function(){
								            if (script.readyState && script.readyState != 'loaded' && script.readyState != 'complete'){
								                return;
								            }
								            script.onreadystatechange = script.onload = null;
								            loaderNumber+=1;
								            if (loaderNumber >= loadCount)
								            	if(opt.callback){
										        	opt.callback(msg);
										        }
								        };
								        var head = document.getElementsByTagName('head').item(0);
								        head.appendChild (script);
				    				}
			    				}
			    			}
						}
					},
					failure: function() {
                    	Gary.loadCheck(this.response);
                    }
				});
			}
		}
	},
	JsLoader:{
		random: true,
		loadCount: 0,
		loaderNumber: 0,
		load: function(js,id,callback,data){
			var scriptId = document.getElementById(id);
		    if(scriptId){
		        if(callback)
		           callback(data);
		        Gary.JsLoader.loaderNumber+=1;
		        //加载个数大于或等于预计加载个数，则触发加载完毕事件
		        if (Gary.JsLoader.loaderNumber >= Gary.JsLoader.loadCount)
		            if (Gary.JsLoader.onLoad){
	                    Gary.JsLoader.onLoad();
	                    Gary.JsLoader.onLoad = null;
	                }
		    }else{
		        var script = document.createElement("script");
		        script.id = id;
		        script.type = "text/javascript";
		        script.onload = script.onreadystatechange = function(){
		            if (script.readyState && script.readyState != 'loaded' && script.readyState != 'complete'){
		                return;
		            }
		            script.onreadystatechange = script.onload = null;
		            //当前文件加载完毕，触发回调事件
		            if (callback)
		                callback(data);
		            Gary.JsLoader.loaderNumber+=1;
		            //加载个数大于或等于预计加载个数，则触发加载完毕事件
		            if (Gary.JsLoader.loaderNumber >= Gary.JsLoader.loadCount)
		                if (Gary.JsLoader.onLoad){
		                    Gary.JsLoader.onLoad();
		                    Gary.JsLoader.onLoad = null;
		                }
		        };
		        script.src = js + (Gary.JsLoader.random ? "?random="+Math.random() : '');
		        var head = document.getElementsByTagName('head').item(0);
		        try {
		        	head.appendChild (script);
				} catch (e) {
					// TODO: handle exception
				}
		    }
		},
		loads: function(arrayjs,onLoad){
			if(!arrayjs || arrayjs.length < 1){
				if(onLoad)onLoad();
				return;
			}
			Gary.JsLoader.loadCount = arrayjs.length;
			Gary.JsLoader.onLoad = onLoad;
			Gary.JsLoader.loaderNumber = 0;
			var i = 0;
			function _load(){
				if(i >= arrayjs.length)return;
				Gary.JsLoader.load(arrayjs[i].js, arrayjs[i].id,function(){
					if(arrayjs[i].callback)
						arrayjs[i].callback(arrayjs[i].data);
					i++;
					_load();
				});
			}
			_load();
		}
	},
	cssLoad: function(src, is){
		var fileref = document.createElement('link');
        fileref.setAttribute("rel","stylesheet");
        fileref.setAttribute("type","text/css");
        fileref.setAttribute("href",src);
        if(typeof fileref != "undefined" && !is){
	        document.getElementsByTagName("head")[0].appendChild(fileref);
	    }
	    return fileref;
	},
	replaceCss: function(oldfilename, newfilename){
		var targetelement = "link";
		var targetattr= "href";
		var allsuspects=document.getElementsByTagName(targetelement)
		for (var i=allsuspects.length; i>=0; i--){
			if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(oldfilename)!=-1){
			   var newelement= Gary.cssLoad(newfilename, true);
			   allsuspects[i].parentNode.replaceChild(newelement, allsuspects[i])
			}
		}
	}
}