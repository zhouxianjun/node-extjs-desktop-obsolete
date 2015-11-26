Ext.define("Ext.util.Observable",{requires:["Ext.util.Event"],statics:{releaseCapture:function(a){a.fireEvent=this.prototype.fireEvent},capture:function(c,b,a){c.fireEvent=Ext.Function.createInterceptor(c.fireEvent,b,a)},observe:function(a,b){if(a){if(!a.isObservable){Ext.applyIf(a,new this());this.capture(a.prototype,a.fireEvent,a)}if(Ext.isObject(b)){a.on(b)}}return a},prepareClass:function(d,c){if(!d.HasListeners){var b=Ext.util.Observable,e=function(){},a=d.superclass.HasListeners||(c&&c.HasListeners)||b.HasListeners;d.prototype.HasListeners=d.HasListeners=e;e.prototype=d.hasListeners=new a()}}},isObservable:true,eventsSuspended:0,constructor:function(a){var b=this;Ext.apply(b,a);if(!b.hasListeners){b.hasListeners=new b.HasListeners()}b.events=b.events||{};if(b.listeners){b.on(b.listeners);b.listeners=null}if(b.bubbleEvents){b.enableBubble(b.bubbleEvents)}},onClassExtended:function(a){if(!a.HasListeners){Ext.util.Observable.prepareClass(a)}},eventOptionsRe:/^(?:scope|delay|buffer|single|stopEvent|preventDefault|stopPropagation|normalized|args|delegate|element|vertical|horizontal|freezeEvent)$/,addManagedListener:function(h,d,f,e,c){var g=this,a=g.managedListeners=g.managedListeners||[],b;if(typeof d!=="string"){c=d;for(d in c){if(c.hasOwnProperty(d)){b=c[d];if(!g.eventOptionsRe.test(d)){g.addManagedListener(h,d,b.fn||b,b.scope||c.scope,b.fn?b:c)}}}}else{a.push({item:h,ename:d,fn:f,scope:e,options:c});h.on(d,f,e,c)}},removeManagedListener:function(h,c,f,j){var e=this,k,b,g,a,d;if(typeof c!=="string"){k=c;for(c in k){if(k.hasOwnProperty(c)){b=k[c];if(!e.eventOptionsRe.test(c)){e.removeManagedListener(h,c,b.fn||b,b.scope||k.scope)}}}}g=e.managedListeners?e.managedListeners.slice():[];for(d=0,a=g.length;d<a;d++){e.removeManagedListenerItem(false,g[d],h,c,f,j)}},fireEvent:function(a){a=a.toLowerCase();var e=this,c=e.events,d=c&&c[a],b=true;if(d&&e.hasListeners[a]){b=e.continueFireEvent(a,Ext.Array.slice(arguments,1),d.bubble)}return b},continueFireEvent:function(c,e,b){var g=this,a,f,d=true;do{if(g.eventsSuspended){if((a=g.eventQueue)){a.push([c,e,b])}return d}else{f=g.events[c];if(f&&f!=true){if((d=f.fire.apply(f,e))===false){break}}}}while(b&&(g=g.getBubbleParent()));return d},getBubbleParent:function(){var b=this,a=b.getBubbleTarget&&b.getBubbleTarget();if(a&&a.isObservable){return a}return null},addListener:function(c,f,h,i){var e=this,b,a,d,g=0;if(typeof c!=="string"){i=c;for(c in i){if(i.hasOwnProperty(c)){b=i[c];if(!e.eventOptionsRe.test(c)){e.addListener(c,b.fn||b,b.scope||i.scope,b.fn?b:i)}}}}else{c=c.toLowerCase();a=e.events[c];if(a&&a.isEvent){g=a.listeners.length}else{e.events[c]=a=new Ext.util.Event(e,c)}if(typeof f==="string"){f=h[f]||e[f]}a.addListener(f,h,i);if(a.listeners.length!==g){d=e.hasListeners;if(d.hasOwnProperty(c)){++d[c]}else{d[c]=1}}}},removeListener:function(c,e,d){var g=this,b,f,a;if(typeof c!=="string"){a=c;for(c in a){if(a.hasOwnProperty(c)){b=a[c];if(!g.eventOptionsRe.test(c)){g.removeListener(c,b.fn||b,b.scope||a.scope)}}}}else{c=c.toLowerCase();f=g.events[c];if(f&&f.isEvent){if(f.removeListener(e,d)&&!--g.hasListeners[c]){delete g.hasListeners[c]}}}},clearListeners:function(){var b=this.events,c,a;for(a in b){if(b.hasOwnProperty(a)){c=b[a];if(c.isEvent){c.clearListeners()}}}this.clearManagedListeners()},clearManagedListeners:function(){var b=this.managedListeners||[],c=0,a=b.length;for(;c<a;c++){this.removeManagedListenerItem(true,b[c])}this.managedListeners=[]},removeManagedListenerItem:function(b,a,f,c,e,d){if(b||(a.item===f&&a.ename===c&&(!e||a.fn===e)&&(!d||a.scope===d))){a.item.un(a.ename,a.fn,a.scope);if(!b){Ext.Array.remove(this.managedListeners,a)}}},addEvents:function(f){var e=this,d=e.events||(e.events={}),a,b,c;if(typeof f=="string"){for(b=arguments,c=b.length;c--;){a=b[c];if(!d[a]){d[a]=true}}}else{Ext.applyIf(e.events,f)}},hasListener:function(a){return !!this.hasListeners[a.toLowerCase()]},suspendEvents:function(a){this.eventsSuspended+=1;if(a&&!this.eventQueue){this.eventQueue=[]}},resumeEvents:function(){var a=this,d=a.eventQueue,c,b;if(a.eventsSuspended&&!--a.eventsSuspended){delete a.eventQueue;if(d){c=d.length;for(b=0;b<c;b++){a.continueFireEvent.apply(a,d[b])}}}},relayEvents:function(c,e,h){var g=this,a=e.length,d=0,f,b;for(;d<a;d++){f=e[d];b=h?h+f:f;g.mon(c,f,g.createRelayer(b))}},createRelayer:function(a,b){var c=this;return function(){return c.fireEvent.apply(c,[a].concat(Array.prototype.slice.apply(arguments,b||[0,-1])))}},enableBubble:function(h){if(h){var f=this,g=(typeof h=="string")?arguments:h,e=g.length,c=f.events,b,d,a;for(a=0;a<e;++a){b=g[a].toLowerCase();d=c[b];if(!d||typeof d=="boolean"){c[b]=d=new Ext.util.Event(f,b)}f.hasListeners[b]=(f.hasListeners[b]||0)+1;d.bubble=true}}}},function(){var a=this,d=a.prototype,b=function(){},e=function(f){if(!f.HasListeners){var g=f.prototype;a.prepareClass(f,this);f.onExtended(function(h){a.prepareClass(h)});if(g.onClassMixedIn){Ext.override(f,{onClassMixedIn:function(h){e.call(this,h);this.callParent(arguments)}})}else{g.onClassMixedIn=function(h){e.call(this,h)}}}};b.prototype={};d.HasListeners=a.HasListeners=b;a.createAlias({on:"addListener",un:"removeListener",mon:"addManagedListener",mun:"removeManagedListener"});a.observeClass=a.observe;function c(l){var k=(this.methodEvents=this.methodEvents||{})[l],h,g,i,j=this,f;if(!k){this.methodEvents[l]=k={};k.originalFn=this[l];k.methodName=l;k.before=[];k.after=[];f=function(o,n,m){if((g=o.apply(n||j,m))!==undefined){if(typeof g=="object"){if(g.returnValue!==undefined){h=g.returnValue}else{h=g}i=!!g.cancel}else{if(g===false){i=true}else{h=g}}}};this[l]=function(){var o=Array.prototype.slice.call(arguments,0),n,p,m;h=g=undefined;i=false;for(p=0,m=k.before.length;p<m;p++){n=k.before[p];f(n.fn,n.scope,o);if(i){return h}}if((g=k.originalFn.apply(j,o))!==undefined){h=g}for(p=0,m=k.after.length;p<m;p++){n=k.after[p];f(n.fn,n.scope,o);if(i){return h}}return h}}return k}Ext.apply(d,{onClassMixedIn:e,beforeMethod:function(h,g,f){c.call(this,h).before.push({fn:g,scope:f})},afterMethod:function(h,g,f){c.call(this,h).after.push({fn:g,scope:f})},removeMethodListener:function(l,j,h){var k=this.getMethodEvent(l),g,f;for(g=0,f=k.before.length;g<f;g++){if(k.before[g].fn==j&&k.before[g].scope==h){Ext.Array.erase(k.before,g,1);return}}for(g=0,f=k.after.length;g<f;g++){if(k.after[g].fn==j&&k.after[g].scope==h){Ext.Array.erase(k.after,g,1);return}}},toggleEventLogging:function(f){Ext.util.Observable[f?"capture":"releaseCapture"](this,function(g){if(Ext.isDefined(Ext.global.console)){Ext.global.console.log(g,arguments)}})}})});

Ext.define("Ext.container.Viewport",{extend:"Ext.container.Container",alias:"widget.viewport",requires:["Ext.EventManager"],alternateClassName:"Ext.Viewport",isViewport:true,ariaRole:"application",preserveElOnDestroy:true,initComponent:function(){var c=this,a=document.body.parentNode,b;Ext.getScrollbarSize();c.width=c.height=undefined;c.callParent(arguments);Ext.fly(a).addCls(Ext.baseCSSPrefix+"viewport");if(c.autoScroll){delete c.autoScroll;Ext.fly(a).setStyle("overflow","auto")}c.el=b=Ext.getBody();b.setHeight=Ext.emptyFn;b.setWidth=Ext.emptyFn;b.setSize=Ext.emptyFn;b.dom.scroll="no";c.allowDomMove=false;c.renderTo=c.el},onRender:function(){var a=this;a.callParent(arguments);a.width=Ext.Element.getViewportWidth();a.height=Ext.Element.getViewportHeight()},afterFirstLayout:function(){var a=this;a.callParent(arguments);setTimeout(function(){Ext.EventManager.onWindowResize(a.fireResize,a)},1)},fireResize:function(b,a){if(b!=this.width||a!=this.height){this.setSize(b,a)}}});