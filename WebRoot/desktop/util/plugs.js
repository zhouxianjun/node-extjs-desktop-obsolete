Ext.define("Ext.Gary.desktop.Module",{mixins:{observable:"Ext.util.Observable"},constructor:function(a){this.mixins.observable.constructor.call(this,a);this.init()},init:Ext.emptyFn});
Ext.define("Ext.Gary.desktop.Video",{extend:"Ext.panel.Panel",alias:"widget.video",layout:"fit",autoplay:false,controls:true,bodyStyle:"background-color:#000;color:#fff",html:"",initComponent:function(){this.callParent()},afterRender:function(){var g;if(this.fallbackHTML){g=this.fallbackHTML}else{g="Your browser does not support HTML5 Video. ";if(Ext.isChrome){g+="Upgrade Chrome."}else{if(Ext.isGecko){g+="Upgrade to Firefox 3.5 or newer."}else{var b='<a href="http://www.google.com/chrome">Chrome</a>';g+='Please try <a href="http://www.mozilla.com">Firefox</a>';if(Ext.isIE){g+=", "+b+' or <a href="http://www.apple.com/safari/">Safari</a>.'}else{g+=" or "+b+"."}}}}var e=this.getSize();var c=Ext.copyTo({tag:"video",width:e.width,height:e.height},this,"poster,start,loopstart,loopend,playcount,autobuffer,loop");if(this.autoplay){c.autoplay=1}if(this.controls){c.controls=1}if(Ext.isArray(this.src)){c.children=[];for(var d=0,a=this.src.length;d<a;d++){if(!Ext.isObject(this.src[d])){Ext.Error.raise('The src list passed to "video" must be an array of objects')}c.children.push(Ext.applyIf({tag:"source"},this.src[d]))}c.children.push({html:g})}else{c.src=this.src;c.html=g}this.video=this.body.createChild(c);var f=this.video.dom;this.supported=(f&&f.tagName.toLowerCase()=="video")},afterComponentLayout:function(){var a=this;a.callParent(arguments);if(a.video){a.video.setSize(a.body.getSize())}},onDestroy:function(){var b=this.video;if(b){var a=b.dom;if(a&&a.pause){a.pause()}b.remove();this.video=null}this.callParent()}});
Ext.define("Ext.Gary.desktop.Wallpaper",{extend:"Ext.Component",alias:"widget.wallpaper",cls:"ux-wallpaper",html:'<img src="'+Ext.BLANK_IMAGE_URL+'">',stretch:false,wallpaper:null,stateful:true,stateId:"desk-wallpaper",afterRender:function(){var a=this;a.callParent();a.setWallpaper(a.wallpaper,a.stretch)},applyState:function(){var b=this,a=b.wallpaper;b.callParent(arguments);if(a!=b.wallpaper){b.setWallpaper(b.wallpaper)}},getState:function(){return this.wallpaper&&{wallpaper:this.wallpaper}},setWallpaper:function(b,a){var c=this,e,d;c.stretch=(a!==false);c.wallpaper=b;if(c.rendered){e=c.el.dom.firstChild;if(!b||b==Ext.BLANK_IMAGE_URL){Ext.fly(e).hide()}else{if(c.stretch){e.src=b;c.el.removeCls("ux-wallpaper-tiled");Ext.fly(e).setStyle({width:"100%",height:"100%"}).show()}else{Ext.fly(e).hide();d="url("+b+")";c.el.addCls("ux-wallpaper-tiled")}}c.el.setStyle({backgroundImage:d||""});if(c.stateful){c.saveState()}}return c}});
Ext.define("Ext.Gary.desktop.StartMenu",{extend:"Ext.panel.Panel",requires:["Ext.menu.Menu","Ext.toolbar.Toolbar"],ariaRole:"menu",cls:"x-menu ux-start-menu",defaultAlign:"bl-tl",iconCls:"user",floating:true,shadow:true,width:300,initComponent:function(){var a=this,b=a.menu;a.menu=new Ext.menu.Menu({cls:"ux-start-menu-body",border:false,floating:false,items:b});a.menu.layout.align="stretch";a.items=[a.menu];a.layout="fit";Ext.menu.Manager.register(a);a.callParent();a.toolbar=new Ext.toolbar.Toolbar(Ext.apply({dock:"right",cls:"ux-start-menu-toolbar",vertical:true,width:100},a.toolConfig));a.toolbar.layout.align="stretch";a.addDocked(a.toolbar);delete a.toolItems;a.on("deactivate",function(){a.hide()})},addMenuItem:function(){var a=this.menu;a.add.apply(a,arguments)},addToolItem:function(){var a=this.toolbar;a.add.apply(a,arguments)},showBy:function(c,f,e){var b=this;if(b.floating&&c){b.layout.autoSize=true;b.show();c=c.el||c;var d=b.el.getAlignToXY(c,f||b.defaultAlign,e);if(b.floatParent){var a=b.floatParent.getTargetEl().getViewRegion();d[0]-=a.x;d[1]-=a.y}b.showAt(d);b.doConstrain()}return b}});
Ext.define("Ext.Gary.desktop.TaskBar",{extend:"Ext.toolbar.Toolbar",requires:["Ext.button.Button","Ext.resizer.Splitter","Ext.menu.Menu"],alias:"widget.taskbar",cls:"ux-taskbar",startBtnText:"开始",initComponent:function(){var a=this;a.startMenu=new Ext.Gary.desktop.StartMenu(a.startConfig);a.quickStart=new Ext.toolbar.Toolbar(a.getQuickStart());a.windowBar=new Ext.toolbar.Toolbar(a.getWindowBarConfig());a.tray=new Ext.toolbar.Toolbar(a.getTrayConfig());a.items=[{xtype:"button",cls:"ux-start-button",iconCls:"ux-start-button-icon",menu:a.startMenu,menuAlign:"bl-tl",text:a.startBtnText},a.quickStart,{xtype:"splitter",html:"&#160;",height:14,width:2,cls:"x-toolbar-separator x-toolbar-separator-horizontal"},a.windowBar,"-",a.tray];a.callParent()},afterLayout:function(){var a=this;a.callParent();a.windowBar.el.on("contextmenu",a.onButtonContextMenu,a)},getQuickStart:function(){var b=this,a={minWidth:20,width:64,items:[],enableOverflow:true};Ext.each(this.quickStart,function(c){a.items.push({tooltip:{text:c.name,align:"bl-tl"},overflowText:c.name,iconCls:c.iconCls,module:c.module,handler:b.onQuickStartClick,scope:b})});return a},getTrayConfig:function(){var a={width:80,items:this.trayItems};delete this.trayItems;return a},getWindowBarConfig:function(){return{flex:1,cls:"ux-desktop-windowbar",items:["&#160;"],layout:{overflowHandler:"Scroller"}}},getWindowBtnFromEl:function(a){var b=this.windowBar.getChildByElement(a);return b||null},onQuickStartClick:function(b){var a=this.app.getModule(b.module),c;if(a){c=a.createWindow();c.show()}},onButtonContextMenu:function(d){var c=this,b=d.getTarget(),a=c.getWindowBtnFromEl(b);if(a){d.stopEvent();c.windowMenu.theWin=a.win;c.windowMenu.showBy(b)}},onWindowBtnClick:function(a){var b=a.win;if(b.minimized||b.hidden){a.setDisabled(true);b.show();var t=setInterval(function(){if(!b.getEl().hasCls('x-hide-offsets')){clearInterval(t);a.setDisabled(false);}},200);}else{if(b.active){a.setDisabled(true);b.minimize();var t=setInterval(function(){if(b.getEl().hasCls('x-hide-offsets')){clearInterval(t);a.setDisabled(false);}},200);}else{b.toFront()}}},addTaskButton:function(c){var a={iconCls:c.iconCls,enableToggle:true,toggleGroup:"all",width:140,margins:"0 2 0 3",text:Ext.util.Format.ellipsis(c.title,20),listeners:{click:this.onWindowBtnClick,scope:this},win:c};var b=this.windowBar.add(a);b.toggle(true);return b},removeTaskButton:function(a){var c,b=this;b.windowBar.items.each(function(d){if(d===a){c=d}return !c});if(c){b.windowBar.remove(c)}return c},setActiveButton:function(a){if(a){a.toggle(true)}else{this.windowBar.items.each(function(b){if(b.isButton){b.toggle(false)}})}}});
Ext.define("Ext.Gary.desktop.TrayClock",{extend:"Ext.toolbar.TextItem",alias:"widget.trayclock",cls:"ux-desktop-trayclock",html:"&#160;",timeFormat:"g:i A",tpl:"{time}",initComponent:function(){var a=this;a.callParent();if(typeof(a.tpl)=="string"){a.tpl=new Ext.XTemplate(a.tpl)}},afterRender:function(){var a=this;Ext.Function.defer(a.updateTime,100,a);a.callParent()},onDestroy:function(){var a=this;if(a.timer){window.clearTimeout(a.timer);a.timer=null}a.callParent()},updateTime:function(){var a=this,b=Ext.Date.format(new Date(),a.timeFormat),c=a.tpl.apply({time:b});if(a.lastText!=c){a.setText(c);a.lastText=c}a.timer=Ext.Function.defer(a.updateTime,10000,a)}});
/**
 * Plugin for PagingToolbar which replaces the textfield input with a slider
 */
Ext.define('Ext.ux.SlidingPager', {
    requires: [
        'Ext.slider.Single',
        'Ext.slider.Tip'
    ],

    /**
     * Creates new SlidingPager.
     * @param {Object} config Configuration options
     */
    constructor : function(config) {
        if (config) {
            Ext.apply(this, config);
        }
    },

    init : function(pbar){
        var idx = pbar.items.indexOf(pbar.child("#inputItem")),
            slider;

        Ext.each(pbar.items.getRange(idx - 2, idx + 2), function(c){
            c.hide();
        });

        slider = Ext.create('Ext.slider.Single', {
            width: 114,
            minValue: 1,
            maxValue: 1,
            hideLabel: true,
            tipText: function(thumb) {
                return Ext.String.format('第 <b>{0}</b> 页,共 <b>{1}</b>页', thumb.value, thumb.slider.maxValue);
            },
            listeners: {
                changecomplete: function(s, v){
                    pbar.store.loadPage(v);
                }
            }
        });

        pbar.insert(idx + 1, slider);

        pbar.on({
            change: function(pb, data){
                if(data){
                    slider.setMaxValue(data.pageCount);
                    slider.setValue(data.currentPage);
                }else{
                    slider.setMaxValue(0);
                    slider.setValue(0);
                }
            }
        });
    }
});

/**
 * Plugin for displaying a progressbar inside of a paging toolbar
 * instead of plain text.
 */
Ext.define('Ext.ux.ProgressBarPager', {

    requires: ['Ext.ProgressBar'],
    /**
     * @cfg {Number} width
     * <p>The default progress bar width.  Default is 225.</p>
     */
    width   : 225,
    /**
     * @cfg {String} defaultText
     * <p>The text to display while the store is loading.  Default is 'Loading...'</p>
     */
    defaultText    : 'Loading...',
    /**
     * @cfg {Object} defaultAnimCfg
     * <p>A {@link Ext.fx.Anim Ext.fx.Anim} configuration object.</p>
     */
    defaultAnimCfg : {
        duration: 1000,
        easing: 'bounceOut'
    },

    /**
     * Creates new ProgressBarPager.
     * @param {Object} config Configuration options
     */
    constructor : function(config) {
        if (config) {
            Ext.apply(this, config);
        }
    },
    //public
    init : function (parent) {
        var displayItem;
        if (parent.displayInfo) {
            this.parent = parent;

            displayItem = parent.child("#displayItem");
            if (displayItem) {
                parent.remove(displayItem, true);
            }

            this.progressBar = Ext.create('Ext.ProgressBar', {
                text    : this.defaultText,
                width   : this.width,
                animate : this.defaultAnimCfg,
                style: {
                    cursor: 'pointer'
                },
                listeners: {
                    el: {
                        scope: this,
                        click: this.handleProgressBarClick
                    }
                }
            });

            parent.displayItem = this.progressBar;

            parent.add(parent.displayItem);
            Ext.apply(parent, this.parentOverrides);
        }
    },
    // private
    // This method handles the click for the progress bar
    handleProgressBarClick : function(e){
        var parent = this.parent,
            displayItem = parent.displayItem,
            box = this.progressBar.getBox(),
            xy = e.getXY(),
            position = xy[0]- box.x,
            pages = Math.ceil(parent.store.getTotalCount() / parent.pageSize),
            newPage = Math.max(Math.ceil(position / (displayItem.width / pages)), 1);

        if(!isNaN(newPage))
            parent.store.loadPage(newPage);
    },

    // private, overriddes
    parentOverrides  : {
        // private
        // This method updates the information via the progress bar.
        updateInfo : function(){
            if(this.displayItem){
                var count = this.store.getCount(),
                    pageData = this.getPageData(),
                    message = count === 0 ?
                        this.emptyMsg :
                        Ext.String.format(
                            this.displayMsg,
                            pageData.fromRecord, pageData.toRecord, this.store.getTotalCount()
                        ),
                    percentage = pageData.pageCount > 0 ? (pageData.currentPage / pageData.pageCount) : 0;

                this.displayItem.updateProgress(percentage, message, this.animate || this.defaultAnimConfig);
            }
        }
    }
});

Ext.define('Ext.ux.RowExpander', {
    extend: 'Ext.AbstractPlugin',

    requires: [
        'Ext.grid.feature.RowBody',
        'Ext.grid.feature.RowWrap'
    ],

    alias: 'plugin.rowexpander',

    rowBodyTpl: null,

    /**
     * @cfg {Boolean} expandOnEnter
     * <tt>true</tt> to toggle selected row(s) between expanded/collapsed when the enter
     * key is pressed (defaults to <tt>true</tt>).
     */
    expandOnEnter: true,

    /**
     * @cfg {Boolean} expandOnDblClick
     * <tt>true</tt> to toggle a row between expanded/collapsed when double clicked
     * (defaults to <tt>true</tt>).
     */
    expandOnDblClick: true,

    /**
     * @cfg {Boolean} selectRowOnExpand
     * <tt>true</tt> to select a row when clicking on the expander icon
     * (defaults to <tt>false</tt>).
     */
    selectRowOnExpand: false,

    rowBodyTrSelector: '.x-grid-rowbody-tr',
    rowBodyHiddenCls: 'x-grid-row-body-hidden',
    rowCollapsedCls: 'x-grid-row-collapsed',



    renderer: function(value, metadata, record, rowIdx, colIdx) {
        if (colIdx === 0) {
            metadata.tdCls = 'x-grid-td-expander';
        }
        return '<div class="x-grid-row-expander">&#160;</div>';
    },

    /**
     * @event expandbody
     * <b<Fired through the grid's View</b>
     * @param {HTMLElement} rowNode The &lt;tr> element which owns the expanded row.
     * @param {Ext.data.Model} record The record providing the data.
     * @param {HTMLElement} expandRow The &lt;tr> element containing the expanded data.
     */
    /**
     * @event collapsebody
     * <b<Fired through the grid's View.</b>
     * @param {HTMLElement} rowNode The &lt;tr> element which owns the expanded row.
     * @param {Ext.data.Model} record The record providing the data.
     * @param {HTMLElement} expandRow The &lt;tr> element containing the expanded data.
     */

    constructor: function() {
        this.callParent(arguments);
        var grid = this.getCmp();
        this.recordsExpanded = {};
        // <debug>
        if (!this.rowBodyTpl) {
            Ext.Error.raise("The 'rowBodyTpl' config is required and is not defined.");
        }
        // </debug>
        // TODO: if XTemplate/Template receives a template as an arg, should
        // just return it back!
        var rowBodyTpl = Ext.create('Ext.XTemplate', this.rowBodyTpl),
            features = [{
                ftype: 'rowbody',
                columnId: this.getHeaderId(),
                recordsExpanded: this.recordsExpanded,
                rowBodyHiddenCls: this.rowBodyHiddenCls,
                rowCollapsedCls: this.rowCollapsedCls,
                getAdditionalData: this.getRowBodyFeatureData,
                getRowBodyContents: function(data) {
                    return rowBodyTpl.applyTemplate(data);
                }
            },{
                ftype: 'rowwrap'
            }];

        if (grid.features) {
            grid.features = features.concat(grid.features);
        } else {
            grid.features = features;
        }

        // NOTE: features have to be added before init (before Table.initComponent)
    },

    init: function(grid) {
        this.callParent(arguments);
        this.grid = grid;
        // Columns have to be added in init (after columns has been used to create the
        // headerCt). Otherwise, shared column configs get corrupted, e.g., if put in the
        // prototype.
        this.addExpander();
        grid.on('render', this.bindView, this, {single: true});
        grid.on('reconfigure', this.onReconfigure, this);
    },

    onReconfigure: function(){
        this.addExpander();
    },

    addExpander: function(){
        this.grid.headerCt.insert(0, this.getHeaderConfig());
    },

    getHeaderId: function() {
        if (!this.headerId) {
            this.headerId = Ext.id();
        }
        return this.headerId;
    },

    getRowBodyFeatureData: function(data, idx, record, orig) {
        var o = Ext.grid.feature.RowBody.prototype.getAdditionalData.apply(this, arguments),
            id = this.columnId;
        o.rowBodyColspan = o.rowBodyColspan - 1;
        o.rowBody = this.getRowBodyContents(data);
        o.rowCls = this.recordsExpanded[record.internalId] ? '' : this.rowCollapsedCls;
        o.rowBodyCls = this.recordsExpanded[record.internalId] ? '' : this.rowBodyHiddenCls;
        o[id + '-tdAttr'] = ' valign="top" rowspan="2" ';
        if (orig[id+'-tdAttr']) {
            o[id+'-tdAttr'] += orig[id+'-tdAttr'];
        }
        return o;
    },

    bindView: function() {
        var view = this.getCmp().getView(),
            viewEl;

        if (!view.rendered) {
            view.on('render', this.bindView, this, {single: true});
        } else {
            viewEl = view.getEl();
            if (this.expandOnEnter) {
                this.keyNav = Ext.create('Ext.KeyNav', viewEl, {
                    'enter' : this.onEnter,
                    scope: this
                });
            }
            if (this.expandOnDblClick) {
                view.on('itemdblclick', this.onDblClick, this);
            }
            this.view = view;
        }
    },

    onEnter: function(e) {
        var view = this.view,
            ds   = view.store,
            sm   = view.getSelectionModel(),
            sels = sm.getSelection(),
            ln   = sels.length,
            i = 0,
            rowIdx;

        for (; i < ln; i++) {
            rowIdx = ds.indexOf(sels[i]);
            this.toggleRow(rowIdx);
        }
    },

    toggleRow: function(rowIdx) {
        var view = this.view,
            rowNode = view.getNode(rowIdx),
            row = Ext.get(rowNode),
            nextBd = Ext.get(row).down(this.rowBodyTrSelector),
            record = view.getRecord(rowNode),
            grid = this.getCmp();

        if (row.hasCls(this.rowCollapsedCls)) {
            row.removeCls(this.rowCollapsedCls);
            nextBd.removeCls(this.rowBodyHiddenCls);
            this.recordsExpanded[record.internalId] = true;
            view.refreshSize();
            view.fireEvent('expandbody', rowNode, record, nextBd.dom);
        } else {
            row.addCls(this.rowCollapsedCls);
            nextBd.addCls(this.rowBodyHiddenCls);
            this.recordsExpanded[record.internalId] = false;
            view.refreshSize();
            view.fireEvent('collapsebody', rowNode, record, nextBd.dom);
        }
    },

    onDblClick: function(view, cell, rowIdx, cellIndex, e) {
        this.toggleRow(rowIdx);
    },

    getHeaderConfig: function() {
        var me                = this,
            toggleRow         = Ext.Function.bind(me.toggleRow, me),
            selectRowOnExpand = me.selectRowOnExpand;

        return {
            id: this.getHeaderId(),
            width: 24,
            sortable: false,
            resizable: false,
            draggable: false,
            hideable: false,
            menuDisabled: true,
            cls: Ext.baseCSSPrefix + 'grid-header-special',
            renderer: function(value, metadata) {
                metadata.tdCls = Ext.baseCSSPrefix + 'grid-cell-special';

                return '<div class="' + Ext.baseCSSPrefix + 'grid-row-expander">&#160;</div>';
            },
            processEvent: function(type, view, cell, recordIndex, cellIndex, e) {
                if (type == "mousedown" && e.getTarget('.x-grid-row-expander')) {
                    var row = e.getTarget('.x-grid-row');
                    toggleRow(row);
                    return selectRowOnExpand;
                }
            }
        };
    }
});
Ext.define('Ext.form.field.Month', {
    extend:'Ext.form.field.Date',
    alias: 'widget.monthfield',
    requires: ['Ext.picker.Month'],
    alternateClassName: ['Ext.form.MonthField', 'Ext.form.Month'],
    selectMonth: null,
    createPicker: function() {
        var me = this,
            format = Ext.String.format;
        return Ext.create('Ext.picker.Month', {
            pickerField: me,
            ownerCt: me.ownerCt,
            renderTo: document.body,
            floating: true,
            hidden: true,
            focusOnShow: true,
            minDate: me.minValue,
            maxDate: me.maxValue,
            disabledDatesRE: me.disabledDatesRE,
            disabledDatesText: me.disabledDatesText,
            disabledDays: me.disabledDays,
            disabledDaysText: me.disabledDaysText,
            format: me.format,
            showToday: me.showToday,
            startDay: me.startDay,
            minText: format(me.minText, me.formatDate(me.minValue)),
            maxText: format(me.maxText, me.formatDate(me.maxValue)),
            listeners: {
                select:        { scope: me,   fn: me.onSelect     },
                monthdblclick: { scope: me,   fn: me.onOKClick     },
                yeardblclick:  { scope: me,   fn: me.onOKClick     },
                OkClick:       { scope: me,   fn: me.onOKClick     },
                CancelClick:   { scope: me,   fn: me.onCancelClick }
            },
            keyNavConfig: {
                esc: function() {
                    me.collapse();
                }
            }
        });
    },
    onCancelClick: function() {
        var me = this;
        me.selectMonth = null;
        me.collapse();
    },
    onOKClick: function() {
        var me = this;
        if( me.selectMonth ) {
            me.setValue(me.selectMonth);
            me.fireEvent('select', me, me.selectMonth);
        }
        me.collapse();
    },
    onSelect: function(m, d) {
        var me = this;
        me.selectMonth = new Date(( d[0]+1 ) +'/1/'+d[1]);
    }
});
Ext.define('Ext.Gary.Settings', {
    extend: 'Ext.window.Window',
    layout: 'anchor',
    title: Gary.language.defaultLang.changeBackground,
    modal: true,
    constrainHeader: true,
    width: 640,
    height: 480,
    border: false,
    initComponent: function () {
        var me = this;

        me.selected = me.desktop.getWallpaper();
        me.stretch = me.desktop.wallpaper.stretch;

        me.preview = Ext.create('widget.wallpaper');
        me.preview.setWallpaper(me.selected);
        me.tree = me.createTree();

        me.buttons = [
            { text: Gary.language.defaultLang.button.ok, handler: me.onOK, scope: me },
            { text: Gary.language.defaultLang.button.cancel, handler: me.close, scope: me }
        ];
        me.items = [{
            anchor: '0 -30',
            border: false,
            layout: 'border',
            items: [
                Ext.create('Ext.Panel', {
                    width: 150,
                    region: 'west',
                    layout: 'anchor',
                    items: [{
                        xtype: 'panel',
                        title: Gary.language.defaultLang.systemBackground,
                        anchor: '100% 50%',
                        overflowY: 'auto',
                        items: me.tree
                    },{
                        xtype: 'panel',
                        title: Gary.language.defaultLang.myBackground,
                        overflowY: 'auto',
                        anchor: '100% 50%'
                    }]
                }),
                {
                    xtype: 'panel',
                    title: Gary.language.defaultLang.preview,
                    region: 'center',
                    layout: 'fit',
                    items: [ me.preview ]
                }
            ]
        },{
            xtype: 'checkbox',
            boxLabel: Gary.language.defaultLang.fitToScreen,
            checked: me.stretch,
            listeners: {
                change: function (comp) {
                    me.stretch = comp.checked;
                }
            }
        }
        ];
        me.callParent();
    },
    createTree : function() {
        var me = this;
        function child (img) {
            return { img: img, text: me.getTextOfWallpaper(img), iconCls: '', leaf: true };
        }
        var tree = new Ext.tree.Panel({
            rootVisible: false,
            lines: false,
            autoScroll: true,
            width: 150,
            region: 'west',
            split: true,
            minWidth: 100,
            listeners: {
                afterrender: { fn: this.setInitialSelection, delay: 100 },
                select: this.onSelect,
                scope: this
            },
            store: new Ext.data.TreeStore({
                model: 'Ext.Gary.WallpaperModel',
                root: {
                    text:'Wallpaper',
                    expanded: true,
                    children:[
                        { text: "None", iconCls: '', leaf: true },
                        child('Blue-Sencha.jpg'),
                        child('Dark-Sencha.jpg'),
                        child('Wood-Sencha.jpg'),
                        child('blue.jpg'),
                        child('desk.jpg'),
                        child('desktop.jpg'),
                        child('desktop2.jpg'),
                        child('sky.jpg')
                    ]
                }
            })
        });
        return tree;
    },
    getTextOfWallpaper: function (path) {
        var text = path, slash = path.lastIndexOf('/');
        if (slash >= 0) {
            text = text.substring(slash+1);
        }
        var dot = text.lastIndexOf('.');
        text = Ext.String.capitalize(text.substring(0, dot));
        text = text.replace(/[-]/g, ' ');
        return text;
    },
    onOK: function () {
        var me = this;
        if (me.selected) {
            me.desktop.setWallpaper(me.selected, me.stretch);
        }
        me.destroy();
    },
    onSelect: function (tree, record) {
        var me = this;

        if (record.data.img) {
            me.selected = 'wallpapers/' + record.data.img;
        } else {
            me.selected = Ext.BLANK_IMAGE_URL;
        }
        me.preview.setWallpaper(me.selected);
    },
    setInitialSelection: function () {
        var s = this.desktop.getWallpaper();
        if (s) {
            var path = '/Wallpaper/' + this.getTextOfWallpaper(s);
            this.tree.selectPath(path, 'text');
        }
    }
});
Ext.define('Ext.Gary.ModularMgr', {
    extend: 'Ext.window.Window',
    layout: 'border',
    title: Gary.language.defaultLang.modularMgr,
    constrainHeader: true,
    width: 640,
    height: 480,
    closeAction: 'hide',
    border: false,
    initComponent: function () {
        var me = this;
        me.mask = new Ext.LoadMask(this, {msg:"Please wait..."});
        me.modularStore = Gary.getStore({
            model: 'Modular',
            action: Gary.config.action.allModulars,
            params: {
                pageSize: Gary.config.page_size
            },
            root: 'data.modulars.items',
            page: 'data.modulars.count'
        });

        me.addModularForm = me.createAddModularForm();
        me.addModularWin = me.createAddModularWin();
        me.addAction = me.createAddAction();

        me.updateModularForm = me.createUpdateModularForm();
        me.updateModularWin = me.createUpdateModularWin();
        me.updateAction = me.createUpdateAction();

        me.deleteAction = me.createDeleteAction();
        me.generateAction = me.createGenerateAction();

        me.paging = Ext.create('Ext.Gary.toolbar.Paging',{
            store: me.modularStore
        });
        me.menus = [me.addAction, me.updateAction, me.deleteAction, me.generateAction];
        me.menu = Ext.create('Ext.menu.Menu', {
            items: me.menus
        });

        me.grid = me.createGrid();
        me.items = [me.grid];
        me.callParent();
    },
    createGrid : function() {
        var me = this;
        var grid = Ext.create('Ext.Gary.grid.Panel', {
            store: me.modularStore,
            columns: [{
                header: Gary.language.defaultLang.modularIdentifer,
                dataIndex: 'modularIdentifer'
            },{
                header: Gary.language.defaultLang.modularName,
                dataIndex: 'name'
            }, {
                hidden: true,
                dataIndex: 'id'
            }, {
                header: Gary.language.defaultLang.local,
                dataIndex: 'local',
                renderer: function(value){
                    return value ? '<span style="color:green;">' + value + '</span>' : '<span style="color:red;">' + value + '</span>';
                }
            },{
                header: Gary.language.defaultLang.icon,
                dataIndex: 'icon',
                renderer: Gary.repMetadata
            }, {
                header: Gary.language.defaultLang.iconLocal,
                dataIndex: 'iconLocal',
                renderer: function(value){
                    return value ? '<span style="color:green;">' + value + '</span>' : '<span style="color:red;">' + value + '</span>';
                }
            }],
            tbar: me.menus,
            bbar: me.paging,
            selModel: new Ext.selection.CheckboxModel({mode: 'single'}),
            listeners: {
                selectionchange: function(view, records) {
                    me.updateAction.setDisabled(!records.length);
                    me.deleteAction.setDisabled(!records.length);
                    if(records[0]){
                        me.generateAction.setDisabled(records[0].get('local'));
                    }else
                        me.generateAction.setDisabled(!records.length);
                },
                itemcontextmenu: function(view,record,item,index,e){
                    e.stopEvent();
                    me.menu.showAt(e.getXY());
                    return false;
                }
            }
        });
        return grid;
    },
    createGenerateAction: function(){
        var me = this;
        var action = Ext.create('Ext.Action', {
            text: Gary.language.defaultLang.generateModular,
            iconCls: 'icon-btn-view',
            handler: function() {
                var select = me.grid.getSelectionModel().getSelection();
                if(select[0]){
                    me.mask.show();
                    Ext.Ajax.request({
                        url: Gary.config.base + Gary.config.action.generateModular + Gary.config.urlPattern,
                        params: {
                            id: select[0].get('id')
                        },
                        success: function(response, opts) {
                            me.mask.hide();
                            var data = Gary.loadCheck(response);
                            if(data){
                                Ext.Msg.alert(Gary.language.defaultLang.prompt,data.executeResult.resultMsg,function(){
                                    me.grid.getStore().reload();
                                });
                            }
                        },
                        failure: function(response, opts) {
                            me.mask.hide();
                            Gary.loadCheck(response);
                        }
                    });
                }
            },
            disabled: true
        });
        return action;
    },
    createAddAction: function(){
        var me = this;
        var addAction = Ext.create('Ext.Action', {
            text: Gary.language.defaultLang.addModular,
            iconCls: 'icon-btn-add',
            handler: function() {
                me.addModularWin.show();
            }
        });
        return addAction;
    },
    createAddModularForm: function(){
        var me = this;
        var combo = Ext.create('Ext.form.field.ComboBox', {
            fieldLabel: Gary.language.defaultLang.modularIdentifer,
            allowBlank: false,
            displayField: 'id',
            name: 'modularIdentifer',
            valueField: 'id',
            store: Gary.getStore({
                model: 'idCombo',
                autoLoad: false,
                action: Gary.config.action.modularFilesStore,
                root: 'data.modularFiles'
            })
        });
        function submit(form){
            me.addModularWin.hide();
            me.mask.show();
            form.submit({
                success: function(form, action) {
                    me.mask.hide();
                    var data = Gary.loadCheck(this.response);
                    if(data){
                        Ext.Msg.alert(Gary.language.defaultLang.prompt,data.executeResult.resultMsg, function(){
                            me.modularStore.reload();
                            me.addModularWin.hide();
                        });
                    }
                },
                failure: function(form, action) {
                    me.mask.hide();
                    Gary.loadCheck(this.response, function(){
                        me.addModularWin.show();
                    });
                }
            });
        }
        var add = Ext.create('Ext.Gary.form.Panel', {
            url: Gary.config.base + Gary.config.action.addModular + Gary.config.urlPattern,
            frame: false,
            items: [combo, {
                fieldLabel: Gary.language.defaultLang.modularName,
                allowBlank: false,
                name: 'name'
            },{
                xtype: 'filefield',
                fieldLabel: Gary.language.defaultLang.icon,
                name: 'icon',
                allowBlank: true,
                buttonText: '',
                buttonConfig: {
                    iconCls: 'icon-btn-upload'
                }
            },{
                hidden: true,
                name: 'create',
                id: 'createModular2',
                value: false
            }],
            onSubmit: function(){
                var form = this.getForm();
                if (form.isValid()) {
                    var val = combo.findRecordByValue(combo.getValue());
                    if(!val){
                        Ext.MessageBox.show({
                            title:'Warning',
                            buttons: Ext.MessageBox.YESNO,
                            msg: Gary.language.defaultLang.msg.modularNotLocal,
                            icon: Ext.MessageBox.WARNING,
                            fn: function(btn){
                                var create = form.findField('createModular2');
                                if(btn=='yes'){
                                    if(create){
                                        create.setValue(true);
                                    }
                                    submit(form);
                                }else{
                                    if(create){
                                        create.setValue(false);
                                    }
                                    submit(form);
                                }
                            }
                        });
                    }else{
                        submit(form);
                    }
                }
            }
        });
        return add;
    },
    createAddModularWin: function(){
        var me = this;
        var win = Ext.create('Ext.window.Window',{
            title: Gary.language.defaultLang.addModular,
            modal: true,
            constrainHeader: true,
            closeAction: 'hide',
            width: 300,
            layout: 'fit',
            items: [me.addModularForm],
            buttons: [{
                text: Gary.language.defaultLang.button.add,
                iconCls: 'icon-btn-accept',
                handler: function() {
                    me.addModularForm.onSubmit();
                }
            },{
                text: Gary.language.defaultLang.clear,
                iconCls: 'icon-btn-reset',
                handler: function() {
                    me.addModularForm.getForm().reset();
                }
            }]
        });
        return win;
    },
    createUpdateAction: function(){
        var me = this;
        var action = Ext.create('Ext.Action', {
            text: Gary.language.defaultLang.updateModular,
            iconCls: 'icon-btn-modify',
            handler: function() {
                var select = me.grid.getSelectionModel().getSelection();
                if(select[0]){
                    me.updateModularForm.loadRecord(select[0]);
                    me.updateModularWin.show();
                }
            },
            disabled: true
        });
        return action;
    },
    createUpdateModularForm: function(){
        var me = this;
        function submit(form){
            me.updateModularWin.hide();
            me.mask.show();
            form.submit({
                success: function(form, action) {
                    me.mask.hide();
                    var data = Gary.loadCheck(this.response);
                    if(data){
                        Ext.Msg.alert(Gary.language.defaultLang.prompt,data.executeResult.resultMsg, function(){
                            me.modularStore.reload();
                            me.updateModularWin.hide();
                        });
                    }
                },
                failure: function(form, action) {
                    me.mask.hide();
                    Gary.loadCheck(this.response, function(){
                        me.updateModularWin.show();
                    });
                }
            });
        }
        var update = Ext.create('Ext.Gary.form.Panel', {
            url: Gary.config.base + Gary.config.action.updateModular + Gary.config.urlPattern,
            frame: false,
            items: [{
                fieldLabel: Gary.language.defaultLang.modularName,
                allowBlank: false,
                readOnly: true,
                name: 'name'
            },{
                hidden: true,
                allowBlank: false,
                name: 'id'
            },{
                xtype: 'filefield',
                fieldLabel: Gary.language.defaultLang.icon,
                name: 'updateIcon',
                allowBlank: true,
                buttonText: '',
                buttonConfig: {
                    iconCls: 'icon-btn-upload'
                }
            }],
            onSubmit: function(){
                var form = this.getForm();
                if (form.isValid()) {
                    submit(form);
                }
            }
        });
        return update;
    },
    createUpdateModularWin: function(){
        var me = this;
        var win = Ext.create('Ext.window.Window',{
            title: Gary.language.defaultLang.updateModular,
            modal: true,
            constrainHeader: true,
            closeAction: 'hide',
            width: 300,
            layout: 'fit',
            items: [me.updateModularForm],
            buttons: [{
                text: Gary.language.defaultLang.button.modify,
                iconCls: 'icon-btn-modify',
                handler: function() {
                    me.updateModularForm.onSubmit();
                }
            },{
                text: Gary.language.defaultLang.clear,
                iconCls: 'icon-btn-reset',
                handler: function() {
                    me.updateModularForm.getForm().reset();
                }
            }]
        });
        return win;
    },
    createDeleteAction: function(){
        var me = this;
        var action = Ext.create('Ext.Action', {
            text: Gary.language.defaultLang.deleteModular,
            iconCls: 'icon-btn-delete',
            handler: function() {
                var select = me.grid.getSelectionModel().getSelection();
                if(select[0]){
                    Ext.Msg.confirm(Gary.language.defaultLang.warning, Gary.language.defaultLang.msg.deleteModular.replace('{0}', select[0].get('name')),function(btn){
                        if(btn=='yes'){
                            Ext.Ajax.request({
                                url: Gary.config.base + Gary.config.action.deleteModular + Gary.config.urlPattern,
                                params: {
                                    modularId: select[0].get('modularIdentifer')
                                },
                                success: function(response, opts) {
                                    var data = Gary.loadCheck(response);
                                    if(data){
                                        Ext.Msg.alert(Gary.language.defaultLang.prompt,data.executeResult.resultMsg,function(){
                                            me.grid.getStore().reload();
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
        return action;
    }
});
Ext.define('Ext.Gary.Settings.Auth', {
    extend: 'Ext.window.Window',
    layout: 'fit',
    title: Gary.language.defaultLang.roleRightsMgr,
    constrainHeader: true,
    width: 640,
    height: 480,
    border: false,
    closeAction: 'hide',
    initComponent: function () {
        var me = this;
        me.mask = new Ext.LoadMask(this, {msg:"Please wait..."});
        me.roleId = 0;
        me.modularId = 0;
        me.functionParentId = 0;

        me.tree = me.createTree();
        me.addAction = me.createAddAction();
        me.updateAction = me.createUpdateAction();
        me.setAction = me.createSetAction();
        me.delAction = me.createDeleteAction();
        me.addModularAction = me.createAddModularAction();
        me.addFunctionAction = me.createAddFunctionAction();
        me.delFunctionAction = me.createDeleteFunctionAction();
        me.addRoleForm = me.createAddRoleForm();
        me.updateRoleForm = me.createUpdateRoleForm();
        me.addModularForm = me.createAddModularForm();
        me.addFunctionForm = me.createAddFunctionForm();
        me.addModularWin = me.createAddModularWin();
        me.addFunctionWin = me.createAddFunctionWin();
        me.roleStore = Gary.getStore({
            model: 'role',
            action: Gary.config.action.roleStore,
            params: {
                pageSize: Gary.config.page_size
            },
            root: 'data.roles.items',
            page: 'data.roles.count'
        });
        me.paging = Ext.create('Ext.Gary.toolbar.Paging',{
            store: me.roleStore
        });
        me.menus = [me.addAction, me.updateAction, me.setAction, me.delAction];
        me.menu = Ext.create('Ext.menu.Menu', {
            items: me.menus
        });
        me.treePanelMenu = Ext.create('Ext.menu.Menu', {
            items: [me.addModularAction]
        });
        me.treeItemMenu = Ext.create('Ext.menu.Menu', {
            items: [me.addFunctionAction, me.delFunctionAction]
        });
        me.tabPanelEast = Ext.create('Ext.Gary.rtab.Panel',{
            items: [me.tree, me.addRoleForm, me.updateRoleForm]
        });
        me.grid = me.createGrid();
        me.items = [{
            layout: 'border',
            items: [
                me.grid,
                me.tabPanelEast
            ]
        }];
        me.callParent();
    },
    createAddModularWin: function(){
        var me = this;
        var win = Ext.create('Ext.window.Window',{
            title: Gary.language.defaultLang.addModular,
            modal: true,
            constrainHeader: true,
            closeAction: 'hide',
            width: 300,
            layout: 'fit',
            items: [me.addModularForm],
            buttons: [{
                text: Gary.language.defaultLang.button.add,
                iconCls: 'icon-btn-accept',
                handler: function() {
                    if(me.roleId != 0){
                        me.addModularForm.onSubmit();
                    }
                }
            },{
                text: Gary.language.defaultLang.clear,
                iconCls: 'icon-btn-reset',
                handler: function() {
                    me.addModularForm.getForm().reset();
                }
            }]
        });
        return win;
    },
    createAddFunctionWin: function(){
        var me = this;
        var win = Ext.create('Ext.window.Window',{
            title: Gary.language.defaultLang.addFunction,
            modal: true,
            constrainHeader: true,
            closeAction: 'hide',
            width: 300,
            layout: 'fit',
            items: [me.addFunctionForm],
            buttons: [{
                text: Gary.language.defaultLang.button.add,
                iconCls: 'icon-btn-accept',
                handler: function() {
                    me.addFunctionForm.onSubmit();
                }
            },{
                text: Gary.language.defaultLang.clear,
                iconCls: 'icon-btn-reset',
                handler: function() {
                    me.addFunctionForm.getForm().reset();
                }
            }]
        });
        return win;
    },
    createGrid: function(){
        var me = this;
        var grid = Ext.create('Ext.Gary.grid.Panel', {
            store: me.roleStore,
            columns: [{
                header: Gary.language.defaultLang.roleId,
                dataIndex: 'id'
            },{
                header: Gary.language.defaultLang.roleName,
                dataIndex: 'name'
            }, {
                header: Gary.language.defaultLang.descr,
                dataIndex: 'descr',
                renderer : Gary.repMetadata
            }, {
                header: Gary.language.defaultLang.stateName,
                dataIndex: 'enable',
                renderer: function(value){
                    return value ? '<span style="color:green;">' + Gary.language.defaultLang.state.enable + '</span>' : '<span style="color:red;">' + Gary.language.defaultLang.state.ST003 + '</span>';
                }
            }],
            tbar: me.menus,
            bbar: me.paging,
            selModel: new Ext.selection.CheckboxModel({mode: 'single'}),
            listeners: {
                selectionchange: function(view, records) {
                    me.setAction.setDisabled(!records.length);
                    me.updateAction.setDisabled(!records.length);
                    me.delAction.setDisabled(!records.length);
                },
                itemcontextmenu: function(view,record,item,index,e){
                    e.stopEvent();
                    me.menu.showAt(e.getXY());
                    return false;
                }
            }
        });
        return grid;
    },
    checkTreeNode: function(node,checked){
        var me = this;
        node.expand();
        node.eachChild(function(child) {
            child.set("checked", checked);
            if(child.hasChildNodes()){
                me.checkTreeNode(child,checked);
            }
        });
        var parent = node.parentNode;
        me.checkParentNode(parent);
    },
    checkParentNode: function(parent){
        var me = this;
        if(!parent.isRoot()){
            var checked = false;
            parent.eachChild(function(child) {
                if(child.get('checked')){
                    checked = true;
                }
            });
            parent.set("checked", checked);
            me.checkParentNode(parent.parentNode);
        }
    },
    createAddModularForm: function(){
        var me = this;
        var combo = Ext.create('Ext.form.field.ComboBox', {
            fieldLabel: Gary.language.defaultLang.modularIdentifer,
            allowBlank: false,
            displayField: 'id',
            name: 'modularIdentifer',
            valueField: 'id',
            store: Gary.getStore({
                model: 'idCombo',
                autoLoad: false,
                action: Gary.config.action.modularFilesStore,
                root: 'data.modularFiles'
            })
        });
        function submit(form){
            me.addModularWin.hide();
            me.mask.show();
            form.submit({
                params: {
                    roleId: me.roleId
                },
                success: function(form, action) {
                    me.mask.hide();
                    var data = Gary.loadCheck(this.response);
                    if(data){
                        Ext.Msg.alert(Gary.language.defaultLang.prompt,data.executeResult.resultMsg, function(){
                            me.tabPanelEast.setActiveTab(me.tree);
                            if(me.tabPanelEast.collapsed)
                                me.tabPanelEast.expand();
                            me.tree.getStore().load({params:{roleId: me.roleId}});
                            me.addModularWin.hide();
                        });
                    }
                },
                failure: function(form, action) {
                    me.mask.hide();
                    Gary.loadCheck(this.response, function(){
                        me.addModularWin.show();
                    });
                }
            });
        }
        var add = Ext.create('Ext.Gary.form.Panel', {
            url: Gary.config.base + Gary.config.action.addModular + Gary.config.urlPattern,
            frame: false,
            items: [combo, {
                fieldLabel: Gary.language.defaultLang.modularName,
                allowBlank: false,
                name: 'name'
            },{
                xtype: 'filefield',
                fieldLabel: Gary.language.defaultLang.icon,
                name: 'icon',
                readOnly: true,
                allowBlank: true,
                buttonText: '',
                buttonConfig: {
                    iconCls: 'icon-btn-upload'
                }
            },{
                hidden: true,
                name: 'create',
                id: 'createModular',
                value: false
            }],
            onSubmit: function(){
                var form = this.getForm();
                if (form.isValid()) {
                    var val = combo.findRecordByValue(combo.getValue());
                    if(!val){
                        Ext.MessageBox.show({
                            title:'Warning',
                            buttons: Ext.MessageBox.YESNO,
                            msg: Gary.language.defaultLang.msg.modularNotLocal,
                            icon: Ext.MessageBox.WARNING,
                            fn: function(btn){
                                var create = form.findField('createModular');
                                if(btn=='yes'){
                                    if(create){
                                        create.setValue(true);
                                    }
                                    submit(form);
                                }else{
                                    if(create){
                                        create.setValue(false);
                                    }
                                    submit(form);
                                }
                            }
                        });
                    }else{
                        submit(form);
                    }
                }
            }
        });
        return add;
    },
    createAddFunctionForm: function(){
        var me = this;
        me.modularFunctionStore = Gary.getStore({
            model: 'idCombo',
            autoLoad: false,
            action: Gary.config.action.functionFilesStore,
            root: 'data.functionFiles',
            params: {modularId: null}
        });
        function submit(form){
            me.addFunctionWin.hide();
            me.mask.show();
            form.submit({
                params: {
                    roleId: me.roleId,
                    modularIdentifer: (me.modularId == 0 ? null : me.modularId),
                    parentId: me.functionParentId,
                    modularId: me.modularNodeId.split('#')[1]
                },
                success: function(form, action) {
                    me.mask.hide();
                    var data = Gary.loadCheck(this.response);
                    if(data){
                        Ext.Msg.alert(Gary.language.defaultLang.prompt,data.executeResult.resultMsg, function(){
                            me.tabPanelEast.setActiveTab(me.tree);
                            if(me.tabPanelEast.collapsed)
                                me.tabPanelEast.expand();
                            me.tree.getStore().load({params:{roleId: me.roleId}});
                            me.addFunctionWin.hide();
                        });
                    }
                },
                failure: function(form, action) {
                    me.mask.hide();
                    Gary.loadCheck(this.response, function(){
                        me.addFunctionWin.show();
                    });
                }
            });
        }
        var combo = Ext.create('Ext.form.field.ComboBox', {
            fieldLabel: Gary.language.defaultLang.functionIdentifer,
            displayField: 'id',
            name: 'extjsId',
            valueField: 'id',
            queryMode: 'local',
            store: me.modularFunctionStore
        });
        var add = Ext.create('Ext.Gary.form.Panel', {
            url: Gary.config.base + Gary.config.action.addFunction + Gary.config.urlPattern,
            frame: false,
            items: [combo, {
                fieldLabel: Gary.language.defaultLang.functionName,
                allowBlank: false,
                name: 'text'
            },{
                hidden: true,
                name: 'create',
                id: 'createFunction',
                value: false
            }],
            onSubmit: function(){
                var form = this.getForm();
                if (form.isValid()) {
                    var val = combo.findRecordByValue(combo.getValue());
                    if(!val){
                        Ext.MessageBox.show({
                            title:'Warning',
                            buttons: Ext.MessageBox.YESNO,
                            msg: Gary.language.defaultLang.msg.functionNotLocal,
                            icon: Ext.MessageBox.WARNING,
                            fn: function(btn){
                                var create = form.findField('createFunction');
                                if(btn=='yes'){
                                    if(create){
                                        create.setValue(true);
                                    }
                                    submit(form);
                                }else{
                                    if(create){
                                        create.setValue(false);
                                    }
                                    submit(form);
                                }
                            }
                        });
                    }else{
                        submit(form);
                    }
                }
            }
        });
        return add;
    },
    createAddModularAction: function(){
        var me = this;
        var action = Ext.create('Ext.Action', {
            text: Gary.language.defaultLang.addModular,
            iconCls: 'icon-btn-add',
            handler: function() {
                if(me.roleId != 0){
                    me.addModularForm.getForm().reset();
                    me.addModularWin.show();
                }
            }
        });
        return action;
    },
    createAddFunctionAction: function(){
        var me = this;
        var action = Ext.create('Ext.Action', {
            text: Gary.language.defaultLang.addFunction,
            iconCls: 'icon-btn-add',
            handler: function() {
                if((me.modularId != 0 || me.functionParentId != 0) && me.roleId != 0 && me.modularNodeId){
                    me.addFunctionForm.getForm().reset();
                    me.addFunctionWin.show();
                    if(me.modularFunctionStore){
                        me.modularFunctionStore.load({params: {modularId: me.modularNodeId.split('#')[1]}});
                    }
                }
            }
        });
        return action;
    },
    createDeleteFunctionAction: function(){
        var me = this;
        var action = Ext.create('Ext.Action', {
            text: Gary.language.defaultLang.deleteFunction,
            iconCls: 'icon-btn-delete',
            handler: function() {
                if(me.roleId != 0){
                    var msg = '';
                    var url = '';
                    var params = {};
                    if(action.getText() == Gary.language.defaultLang.deleteFunction){
                        msg = Gary.language.defaultLang.msg.deleteFunction.replace('{0}', me.functionName);
                        url = Gary.config.base + Gary.config.action.deleteFunction + Gary.config.urlPattern;
                        params = {
                            fid: me.functionId
                        };
                    }else{
                        msg = Gary.language.defaultLang.msg.deleteModular.replace('{0}', me.modularName);
                        url = Gary.config.base + Gary.config.action.deleteModular + Gary.config.urlPattern;
                        params = {
                            modularId: me.modularId
                        };
                    }
                    Ext.Msg.confirm(Gary.language.defaultLang.warning,msg,function(btn){
                        if(btn=='yes'){
                            Ext.Ajax.request({
                                url: url,
                                params: params,
                                success: function(response, opts) {
                                    var data = Gary.loadCheck(response);
                                    if(data){
                                        Ext.Msg.alert(Gary.language.defaultLang.prompt,data.executeResult.resultMsg,function(){
                                            me.tree.getStore().load({params:{roleId: me.roleId}});
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
            }
        });
        return action;
    },
    createDeleteAction: function(){
        var me = this;
        var delAction = Ext.create('Ext.Action', {
            text: Gary.language.defaultLang.deleteRole,
            iconCls: 'icon-btn-delete',
            handler: function() {
                var select = me.grid.getSelectionModel().getSelection();
                if(select[0]){
                    Ext.Msg.confirm(Gary.language.defaultLang.warning, Gary.language.defaultLang.msg.deleteRole.replace('{0}', select[0].get('name')),function(btn){
                        if(btn=='yes'){
                            Ext.Ajax.request({
                                url: Gary.config.base + Gary.config.action.deleteRole + Gary.config.urlPattern,
                                params: {
                                    id: select[0].get('id')
                                },
                                success: function(response, opts) {
                                    var data = Gary.loadCheck(response);
                                    if(data){
                                        Ext.Msg.alert(Gary.language.defaultLang.prompt,data.executeResult.resultMsg,function(){
                                            me.grid.getStore().reload();
                                            if(me.roleId == select[0].get('id')){
                                                me.tree.getStore().load({params:{}});
                                            }
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
        return delAction;
    },
    createAddAction: function(){
        var me = this;
        var addAction = Ext.create('Ext.Action', {
            text: Gary.language.defaultLang.addRole,
            iconCls: 'icon-btn-add',
            handler: function() {
                me.tabPanelEast.setActiveTab(me.addRoleForm);
                if(me.tabPanelEast.collapsed)
                    me.tabPanelEast.expand();
            }
        });
        return addAction;
    },
    createSetAction: function(){
        var me = this;
        var setAction = Ext.create('Ext.Action', {
            text: Gary.language.defaultLang.settingRoleRights,
            iconCls: 'icon-btn-setting',
            handler: function() {
                var select = me.grid.getSelectionModel().getSelection();
                if(select[0]){
                    me.roleId = select[0].get('id');
                    me.tree.getStore().load({params:{roleId: me.roleId}});
                    me.tabPanelEast.setActiveTab(me.tree);
                    if(me.tabPanelEast.collapsed)
                        me.tabPanelEast.expand();
                }
            },
            disabled: true
        });
        return setAction;
    },
    createUpdateAction: function(){
        var me = this;
        var modifyAction = Ext.create('Ext.Action', {
            text: Gary.language.defaultLang.modifyRole,
            iconCls: 'icon-btn-modify',
            handler: function() {
                var select = me.grid.getSelectionModel().getSelection();
                if(select[0]){
                    me.updateRoleForm.loadRecord(select[0]);
                    me.tabPanelEast.setActiveTab(me.updateRoleForm);
                    if(me.tabPanelEast.collapsed)
                        me.tabPanelEast.expand();
                }
            },
            disabled: true
        });
        return modifyAction;
    },
    createUpdateRoleForm: function(){
        var me = this;
        var enable = Ext.create('Ext.data.Store', {
            fields: ['name', 'value'],
            data : [
                {'name': Gary.language.defaultLang.state.ST003, 'value': false},
                {'name': Gary.language.defaultLang.state.enable, 'value': true}
            ]
        });
        var modify = Ext.create('Ext.Gary.form.Panel', {
            title: Gary.language.defaultLang.modifyRole,
            url: Gary.config.base + Gary.config.action.updateRole + Gary.config.urlPattern,
            items: [{
                hidden: true,
                name: 'id'
            },{
                fieldLabel: Gary.language.defaultLang.roleName,
                allowBlank:false,
                name: 'name'
            },{
                fieldLabel: Gary.language.defaultLang.descr,
                name: 'descr'
            },{
                xtype: 'combobox',
                fieldLabel: Gary.language.defaultLang.isEnable,
                queryMode: 'local',
                displayField: 'name',
                valueField: 'value',
                emptyText: Gary.language.defaultLang.select,
                store: enable,
                name: 'enable'
            }],
            onSubmit: function(){
                var form = this.getForm();
                if (form.isValid()) {
                    me.mask.show();
                    form.submit({
                        submitEmptyText: false,
                        success: function(form, action) {
                            me.mask.hide();
                            var data = Gary.loadCheck(this.response);
                            if(data){
                                Ext.Msg.alert(Gary.language.defaultLang.prompt,data.executeResult.resultMsg,function(){
                                    me.grid.getStore().reload();
                                });
                            }
                        },
                        failure: function(form, action) {
                            me.mask.hide();
                            Gary.loadCheck(this.response);
                        }
                    });
                }
            },
            buttons: [{
                text: Gary.language.defaultLang.button.modify,
                iconCls: 'icon-btn-accept',
                handler: function() {
                    modify.onSubmit();
                }
            },{
                text: Gary.language.defaultLang.clear,
                iconCls: 'icon-btn-reset',
                handler: function() {
                    modify.getForm().reset();
                }
            }]
        });
        return modify;
    },
    createAddRoleForm: function(){
        var me = this;
        var add = Ext.create('Ext.Gary.form.Panel', {
            title: Gary.language.defaultLang.addRole,
            url: Gary.config.base + Gary.config.action.addRole + Gary.config.urlPattern,
            items: [{
                fieldLabel: Gary.language.defaultLang.roleName,
                allowBlank: false,
                name: 'name'
            },{
                fieldLabel: Gary.language.defaultLang.descr,
                name: 'descr'
            }],
            onSubmit: function(){
                var form = this.getForm();
                if (form.isValid()) {
                    me.mask.show();
                    form.submit({
                        success: function(form, action) {
                            me.mask.hide();
                            var data = Gary.loadCheck(this.response);
                            if(data){
                                Ext.Msg.alert(Gary.language.defaultLang.prompt,data.executeResult.resultMsg, function(){
                                    me.grid.getStore().reload();
                                });
                            }
                        },
                        failure: function(form, action) {
                            me.mask.hide();
                            Gary.loadCheck(this.response);
                        }
                    });
                }
            },
            buttons: [{
                text: Gary.language.defaultLang.button.add,
                iconCls: 'icon-btn-accept',
                handler: function() {
                    add.onSubmit();
                }
            },{
                text: Gary.language.defaultLang.clear,
                iconCls: 'icon-btn-reset',
                handler: function() {
                    add.getForm().reset();
                }
            }]
        });
        return add;
    },
    createTree : function() {
        var me = this;
        var tree = new Ext.Gary.tree.Panel({
            title: Gary.language.defaultLang.currentlyOwnsRights,
            store: new Ext.data.TreeStore({
                nodeParam: 'node',
                model: 'TreeModel',
                proxy: {
                    type: 'ajax',
                    url: Gary.config.base + Gary.config.action.allAuth + Gary.config.urlPattern,
                    extraParams: {},
                    reader: {
                        type: 'json',
                        root: ''
                    },
                    listeners: {
                        exception: Gary.loadError
                    }
                }
            }),
            listeners: {
                checkchange: function(node,checked){
                    me.checkTreeNode(node,checked);
                },
                itemcontextmenu: function(view,record,item,index,e){
                    e.stopEvent();
                    if(record.raw.fid){
                        me.functionParentId = record.raw.fid;
                        me.modularId = 0;
                        me.delFunctionAction.setText(Gary.language.defaultLang.deleteFunction);
                    }
                    if(!record.get('leaf') && !record.raw.fid){
                        me.modularId = record.get('id').split('#')[1];
                        me.functionParentId = 0;
                        me.delFunctionAction.setText(Gary.language.defaultLang.deleteModular);
                        me.modularName = record.get('text');
                    }
                    me.functionId = record.raw.fid;
                    me.functionName = record.raw.text;
                    me.treeItemMenu.showAt(e.getXY());
                    me.modularNodeId = me.getModularNode(record).get('id');
                    return false;
                },
                containercontextmenu: function(view, e, eOps){
                    e.stopEvent();
                    me.treePanelMenu.showAt(e.getXY());
                    return false;
                }
            },
            buttonAlign: 'right',
            buttons: [{
                xtype: 'button',
                text: Gary.language.defaultLang.button.save,
                handler: function(){
                    me.onOK();
                }
            }]
        });
        return tree;
    },
    getModularNode: function(node){
        if(node.parentNode.isRoot()){
            return node;
        }else{
            return this.getModularNode(node.parentNode);
        }
    },
    onOK: function () {
        var me = this;
        var records = me.tree.getView().getChecked();
        var modular = [];
        var functions = [];
        for ( var i = 0; i < records.length; i++) {
            var record = records[i];
            if(!record.raw.fid){
                modular.push(record.raw.id.split('#')[1]);
            }else{
                functions.push(record.raw.fid);
            }
        }
        me.mask.show();
        Ext.Ajax.request({
            url: Gary.config.base + Gary.config.action.set + Gary.config.urlPattern,
            params: {
                modular: Ext.JSON.encode(modular),
                functions: Ext.JSON.encode(functions),
                roleId: me.roleId
            },
            success: function(response, opts) {
                var data = Gary.loadCheck(response);
                me.mask.hide();
                if(data){
                    Ext.Msg.alert(Gary.language.defaultLang.prompt,data.executeResult.resultMsg);
                }
            },
            failure: function(response, opts) {
                me.mask.hide();
                Gary.loadCheck(response);
            }
        });
    }
});
Ext.define('Ext.Gary.tree.Panel', {
    extend: 'Ext.tree.Panel',
    alias: ['widget.ux_tree'],
    animate:true,
    useArrows: true,
    animCollapse: true,
    rootVisible: false,
    dockedItems: [{
        xtype: 'toolbar',
        items: [{
            text: Gary.language.defaultLang.expandAll,
            handler: function(){
                this.ownerCt.ownerCt.expandAll();
            }
        }, {
            text: Gary.language.defaultLang.closeAll,
            handler: function(){
                this.ownerCt.ownerCt.collapseAll();
            }
        }]
    }]
});
Ext.define('Ext.Gary.tree.Navigation', {
    extend: 'Ext.Gary.tree.Panel',
    alias: ['widget.ux_navigation'],
    region: 'west',
    split: true,
    collapsible: true,
    width: 150,
    minWidth: 100,
    maxWidth: 160,
    title: Gary.language.defaultLang.navigationPanel,
    listeners: {
        itemclick: function(tree, record){
            var win = this.ownerCt;
            if(record.get('leaf')){
                Gary.Gzip.load({
                    files: 'desktop/function/' + Gary.getFolder(win.id) + '/' + Gary.getFile(record.get('id')),
                    id: 'tree-' + win.id,
                    callback: function(response,opts){
                        Gary.addTabPanel(win.leftTab,Gary.config.com + '.' + record.get('id'));
                    }
                });
            }
            /*Gary.JsLoader.load(Gary.config.fn_path + Gary.getFolder(record.get('id')) + '/' + Gary.getFile(record.get('id')),record.get('id'),function(){
             Gary.addTabPanel(win.leftTab,record.get('id'));
             });*/
        }
    }
});
Ext.define('Ext.Gary.rtab.Panel',{
    extend: 'Ext.tab.Panel',
    alias: ['widget.ux_rtabpanel'],
    region : 'east',
    title: Gary.language.defaultLang.multifunctionPanel,
    animCollapse: false,
    collapsible: true,
    collapsed: true,
    split: true,
    width: 225,
    minSize: 175,
    maxSize: 400,
    margins: '0 5 0 0',
    tabPosition: 'bottom'
});
Ext.define('Ext.Gary.tab.Panel', {
    extend: 'Ext.tab.Panel',
    alias: ['widget.ux_tabpanel'],
    region : 'center'
});
Ext.define('Ext.Gary.grid.Panel', {
    extend: 'Ext.grid.Panel',
    alias: ['widget.ux_gridpanel'],
    region : 'center'
});
Ext.define('Ext.Gary.form.Panel', {
    extend: 'Ext.form.Panel',
    alias: ['widget.ux_formpanel'],
    width: '100%',
    frame: true,
    bodyPadding: 5,
    autoScroll: true,
    autoScroll: true,
    fieldDefaults: {
        msgTarget: 'side',
        labelWidth: 85
    },
    defaults: {
        xtype: 'textfield',
        anchor: '100%',
        listeners: {
            specialkey: function(field, e){
                if (e.getKey() == e.ENTER) {
                    this.ownerCt.onSubmit();
                }
            }
        }
    }
});
Ext.define('Ext.Gary.toolbar.Paging', {
    extend: 'Ext.toolbar.Paging',
    alias: ['widget.ux_paging'],
    displayInfo: true,
    beforePageText: Gary.language.defaultLang.paging.beforePageText,
    afterPageText: Gary.language.defaultLang.paging.afterPageText,
    displayMsg: Gary.language.defaultLang.paging.displayMsg,
    emptyMsg: Gary.language.defaultLang.paging.emptyMsg,
    listeners: {
        beforechange: function(cmp,page){
            cmp.store.currentPage = page;
            if(this.queryStore)
                this.queryStore.page = page;
            cmp.store.load({params: this.queryStore,callback: function(r,options,success){
                if(success == false){
                    Gary.loadError(this.proxy);
                }
            }});
            return false;
        },
        change: function(cmp,pagedate){
            if(cmp.total){
                var r = cmp.getStore().data.items[0];
                var item = cmp.child('#displayItem');
                item.setText('<span style="margin-right: 10px;color: black">短信合计: '+r.get('smsSumProfit')+'元</span>' +
                    '<span style="margin-right: 10px;color: black">传真合计: '+r.get('faxSumProfit')+'元</span>' +
                    '<span style="margin-right: 10px;color: black">回拨合计: '+r.get('callbackSumProfit')+'元</span>' +
                    '<span style="margin-right: 10px;color: black">会议合计: '+r.get('conferSumProfit')+'元</span>' +
                    '<span style="margin-right: 10px;color: black">套餐合计: '+r.get('packetSumProfit')+'元</span>' +
                    '<span style="margin-right: 10px;color: black">合计: '+r.get('sumProfit')+'元</span>'+item.el.getHTML());
            }
        }
    }
});