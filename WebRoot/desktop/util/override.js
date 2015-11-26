Gary.language.defaultLang = Gary.language.zh_CN;
if(Ext.isIE6 || Ext.isIE7){
	var tests = Ext.supports.tests;
	for(var i = 0; i < tests.length; i++){
		if(tests[i].identity == 'Vml'){
			tests[i].fn = function(){
				return true;
			}
		}
	}
}
Ext.override(Ext.tree.ViewDropZone, {
    getPosition: function (e, node) {
        var view = this.view,
        record = view.getRecord(node),
        y = e.getPageY(),
        noAppend = record.isLeaf(),
        noBelow = false,
        region = Ext.fly(node).getRegion(),
        fragment;

        if (record.isRoot()) {
            return 'append';
        }

        if (this.appendOnly) {
            return noAppend ? false : 'append';
        }
        if (!this.allowParentInsert) {
            //leehom modify begin
            noBelow = this.allowLeafInserts || (record.hasChildNodes() && record.isExpanded());
            //leehom modify end
        }

        fragment = (region.bottom - region.top) / (noAppend ? 2 : 3);
        if (y >= region.top && y < (region.top + fragment)) {
            return 'before';
        }
        else if (!noBelow && (noAppend || (y >= (region.bottom - fragment) && y <= region.bottom))) {
            return 'after';
        }
        else {
            return 'append';
        }
    },
    handleNodeDrop: function (data, targetNode, position) {
        var me = this,
        view = me.view,
        parentNode = targetNode.parentNode,
        store = view.getStore(),
        recordDomNodes = [],
        records, i, len,
        insertionMethod, argList,
        needTargetExpand,
        transferData,
        processDrop;
        if (me.copy) {
            records = data.records;
            data.records = [];
            for (i = 0, len = records.length; i < len; i++) {
                data.records.push(Ext.apply({}, records[i].data));
            }
        }
        me.cancelExpand();
        if (position == 'before') {
            insertionMethod = parentNode.insertBefore;
            argList = [null, targetNode];
            targetNode = parentNode;
        }
        else if (position == 'after') {
            if (targetNode.nextSibling) {
                insertionMethod = parentNode.insertBefore;
                argList = [null, targetNode.nextSibling];
            }
            else {
                insertionMethod = parentNode.appendChild;
                argList = [null];
            }
            targetNode = parentNode;
        }
        else {
            //leehom add begin
            if (this.allowLeafInserts) {
                if (targetNode.get('leaf')) {
                    targetNode.set('leaf', false);
                    targetNode.set('expanded', true);
                }
            }
            //leehom add end
            if (!targetNode.isExpanded()) {
                needTargetExpand = true;
            }
            insertionMethod = targetNode.appendChild;
            argList = [null];
        }

        transferData = function () {
            var node;
            for (i = 0, len = data.records.length; i < len; i++) {
                argList[0] = data.records[i];
                node = insertionMethod.apply(targetNode, argList);
                if (Ext.enableFx && me.dropHighlight) {
                    recordDomNodes.push(view.getNode(node));
                }
            }
            if (Ext.enableFx && me.dropHighlight) {
                Ext.Array.forEach(recordDomNodes, function (n) {
                    if (n) {
                        Ext.fly(n.firstChild ? n.firstChild : n).highlight(me.dropHighlightColor);
                    }
                });
            }
        };
        if (needTargetExpand) {
            targetNode.expand(false, transferData);
        }
        else {
            transferData();
        }
    }
});

Ext.override(Ext.grid.View,  { enableTextSelection: true });

Ext.override(Ext.tree.plugin.TreeViewDragDrop, {
    allowLeafInserts: true,

    onViewRender: function (view) {
        var me = this;
        if (me.enableDrag) {
            me.dragZone = Ext.create('Ext.tree.ViewDragZone', {
                view: view,
                allowLeafInserts: me.allowLeafInserts,
                copy: me.copy,
                ddGroup: me.dragGroup || me.ddGroup,
                dragText: me.dragText,
                repairHighlightColor: me.nodeHighlightColor,
                repairHighlight: me.nodeHighlightOnRepair
            });
        }

        if (me.enableDrop) {
            me.dropZone = Ext.create('Ext.tree.ViewDropZone', {
                view: view,
                ddGroup: me.dropGroup || me.ddGroup,
                allowContainerDrops: me.allowContainerDrops,
                appendOnly: me.appendOnly,
                copy: me.copy,
                allowLeafInserts: me.allowLeafInserts,
                allowParentInserts: me.allowParentInserts,
                expandDelay: me.expandDelay,
                dropHighlightColor: me.nodeHighlightColor,
                dropHighlight: me.nodeHighlightOnDrop
            });
        }
    }
});
Ext.override(Ext.tab.Panel, {
	setActiveTab: function(card) {
        var me = this,
            previous;

        card = me.getComponent(card);
        if (card) {
            previous = me.getActiveTab();

            if (previous !== card && me.fireEvent('beforetabchange', me, card, previous) === false) {
                return false;
            }

            // We may be passed a config object, so add it.
            // Without doing a layout!
            if (!card.isComponent) {
                Ext.suspendLayouts();
                card = me.add(card);
                Ext.resumeLayouts();
            }

            // MUST set the activeTab first so that the machinery which listens for show doesn't
            // think that the show is "driving" the activation and attempt to recurse into here.
            me.activeTab = card;

            // Attempt to switch to the requested card. Suspend layouts because if that was successful
            // we have to also update the active tab in the tab bar which is another layout operation
            // and we must coalesce them.
            Ext.suspendLayouts();
            me.layout.setActiveItem(card);

            // Read the result of the card layout. Events dear boy, events!
            card = me.activeTab = me.layout.getActiveItem();

            // Card switch was not vetoed by an event listener
            if (card && card !== previous) {

                // Update the active tab in the tab bar and resume layouts.
                me.tabBar.setActiveTab(card.tab);
                Ext.resumeLayouts(true);

                // previous will be undefined or this.activeTab at instantiation
                if (previous !== card) {
                	//重写tabPanel自动换标题
                	me.setTitle(card.title);
                    me.fireEvent('tabchange', me, card, previous);
                }
            }
            // Card switch was vetoed by an event listener. Resume layouts (Nothing should have changed on a veto).
            else {
                Ext.resumeLayouts(true);
            }
            return card;
        }
    }
});
Ext.override(Ext.tab.Panel, {
	afterRender: function(){
		var me = this;

        me.callParent();

        if (!(me.x && me.y) && (me.pageX || me.pageY)) {
            me.setPagePosition(me.pageX, me.pageY);
        }
        if(me.xtype == 'ux_rtabpanel'){
        	me.getTabBar().hide();
        }
	}
});
Ext.apply(Ext.form.Basic.prototype,{
	reset: function(){
		Ext.suspendLayouts();

        var me = this,
            fields = me.getFields().items,
            f,
            fLen = fields.length;

        for (f = 0; f < fLen; f++) {
        	if(fields[f].hidden != true && fields[f].readOnly != true){
            	fields[f].reset();
        	}
        }

        Ext.resumeLayouts(true);
        return me;
	}
});
/*Ext.override(Ext.form.field.ComboBox, {
    setValue: function(value, doSelect) {
        var me = this,
            valueNotFoundText = me.valueNotFoundText,
            inputEl = me.inputEl,
            i, len, record,
            models = [],
            displayTplData = [],
            processedValue = [];

        if (me.store.loading) {
            // Called while the Store is loading. Ensure it is processed by the onLoad method.
            me.value = value;
            me.setHiddenValue(me.value);
            return me;
        }

        // This method processes multi-values, so ensure value is an array.
        value = Ext.Array.from(value);

        // Loop through values
        for (i = 0, len = value.length; i < len; i++) {
            record = value[i];
            if (!record || !record.isModel) {
                record = me.findRecordByValue(record);
            }
            // record found, select it.
            if (record) {
                models.push(record);
                displayTplData.push(record.data);
                processedValue.push(record.get(me.valueField));
            }
            // record was not found, this could happen because
            // store is not loaded or they set a value not in the store
            else {
                // If we are allowing insertion of values not represented in the Store, then set the value, and the display value
                if (!me.forceSelection) {
                    displayTplData.push(value[i]);
                    processedValue.push(value[i]);
                }
                // Else, if valueNotFoundText is defined, display it, otherwise display nothing for this value
                else if (Ext.isDefined(valueNotFoundText)) {
                    displayTplData.push(valueNotFoundText);
                }
            }
        }

        // Set the value of this field. If we are multiselecting, then that is an array.
        me.setHiddenValue(processedValue);
        me.value = me.multiSelect ? processedValue : processedValue[0];
        if (!Ext.isDefined(me.value)) {
            me.value = null;
        }
        me.displayTplData = displayTplData; //store for getDisplayValue method
        me.lastSelection = me.valueModels = models;

        if (inputEl && me.emptyText && !Ext.isEmpty(value)) {
            inputEl.removeCls(me.emptyCls);
        }

        // Calculate raw value from the collection of Model data
        me.setRawValue(me.getDisplayValue());
        me.checkChange();

        if (doSelect !== false) {
            me.syncSelection();
        }
        me.applyEmptyText();

        return me;
    }
});*/
Ext.override(Ext.grid.RowEditor,
    {
      addFieldsForColumn : function(column, initial) {
	  var me = this, i, length, field;
	  if (Ext.isArray(column)) {
	      for (i = 0, length = column.length; i < length; i++) {
		   me.addFieldsForColumn(column[i], initial);
	      }
	      return;
	   }
	if (column.getEditor) {
	      field = column.getEditor(null, {
		                        xtype : 'displayfield',
					getModelData : function() {
							return null;
					}
		       });
	   if (column.align === 'right') {
	      field.fieldStyle = 'text-align:right';
	   }
	   if (column.xtype === 'actioncolumn') {
	    field.fieldCls += ' ' + Ext.baseCSSPrefix+ 'form-action-col-field';
	   }
	   if (me.isVisible() && me.context) {
	      if (field.is('displayfield')) {
		  me.renderColumnData(field, me.context.record,column);
		} else {
		  field.suspendEvents();
		  field.setValue(me.context.record.get(column.dataIndex));
		  field.resumeEvents();
		}
	    }
            if (column.hidden) {
	        me.onColumnHide(column);
	    } else if (column.rendered && !initial) {
	        me.onColumnShow(column);
	    }

	    // -- start edit
	    me.mon(field, 'change', me.onFieldChange, me);
	    // -- end edit
         }
   }
});
Ext.apply(Ext.form.field.VTypes, {
    //  验证函数
    date: function(val, field) {
        if (field.initialDateField) {
            //var update = field.up('form').down('#' + field.initialDateField);
            var update = Ext.getCmp(field.initialDateField);
            update = update.getValue();
            if(!update)return false;
            update = update.getTime();
            var zjdate = new Date(val).getTime();
            if(update == zjdate)
            	return true;
            else
            	return (update < zjdate);
        }
        return true;
    },
    dateText: Gary.language.defaultLang.vtype.date
});