Ext.define("Ext.Gary.desktop.ShortcutModel",{extend:"Ext.data.Model",fields:[{name:"name"},{name:"iconCls"},{name:"module"},{name:"tip"}]});
Ext.define("Ext.Gary.WallpaperModel",{extend:"Ext.data.Model",fields:[{name:"text"},{name:"img"}]});
Ext.define('TreeModel', {
    extend: 'Ext.data.Model',
    fields: [
        'id','text','cls','parent',
        {name: 'leaf', type: 'bool'},
        {name: 'expanded', type: 'bool'}
    ]
});
Ext.define('role', {
    extend: 'Ext.data.Model',
    fields: [
        'descr','name',
        {name: 'id', type: 'int'},
        {name: 'enable', type: 'bool'}
    ]
});
Ext.define('idCombo', {
    extend: 'Ext.data.Model',
    fields: [
        'id'
    ]
});
Ext.define('Modular', {
    extend: 'Ext.data.Model',
    fields: [
        'name','modularIdentifer','icon',
        {name: 'id', type: 'int'},
        {name: 'local', type: 'bool'},
        {name: 'iconLocal', type: 'bool'}
    ]
});
Ext.define('MiddlewareFunction', {
    extend: 'Ext.data.Model',
    fields: [
        'name','business','memo','type',
        {name: 'id', type: 'int'},
        {name: 'session_open', mapping: 'session.open', type: 'bool', defaultValue: false},
        {name: 'session_webSessionUrl', mapping: 'session.webSessionUrl'},
        {name: 'session_webSessionTime', mapping: 'session.webSessionTime', type: 'int'},
        {name: 'session_webSessionMaxTime', mapping: 'session.webSessionMaxTime', type: 'int'},
        {name: 'session_single', mapping: 'session.single', type: 'bool', defaultValue: true},
        {name: 'session_userKey', mapping: 'session.userKey'},
        {name: 'session_logoutUrl', mapping: 'session.logoutUrl'},
        {name: 'session_validate', mapping: 'session.validate'}
    ]
});
Ext.define('MiddlewareAction', {
    extend: 'Ext.data.Model',
    fields: [
        'name','method','memo','path','httpMethod','coding',
        {name: 'id', type: 'int'},
        {name: 'functionId', type: 'int'},
        {name: 'level', type: 'int'},
        {name: 'returnData', type: 'bool', defaultValue: true}
    ]
});
Ext.define('MiddlewareComponentMethod', {
    extend: 'Ext.data.Model',
    fields: [
        'name'
    ]
});
Ext.define('MiddlewareAuthUser', {
    extend: 'Ext.data.Model',
    fields: [
        'userName','type','idCard','addrProvince','addrCity','addr','mobile','email','mainUrl','companyName','businessLicense','authClientId','companyTel','regDate','successDate','state',
        {name: 'id', type: 'int'},
        {name: 'addrAll', convert: function(v, rec){
            return (rec.data.addrProvince || '') + (rec.data.addrCity || '') + '(' + rec.data.addr + ')';
        }}
    ]
});
Ext.define('Plan', {
    extend: 'Ext.data.Model',
    fields: [
        'planName','userId','state','cbBussName','confBussName',
        {name: 'planId', type: 'int'},
        {name: 'faxTariff', type: 'number'},
        {name: 'smsTariff', type: 'number'},
        {name: 'cbBussId', type: 'int'},
        {name: 'confBussId', type: 'int'},
        {name: 'audioFreeConfs', type: 'number'},
        {name: 'audioPCTariff', type: 'number'},
        {name: 'confPSTNInTariff', type: 'number'},
        {name: 'createTime', type: 'date', dateFormat: 'Y-m-d H:i:s'}
    ]
});
Ext.define('EnumType', {
    extend: 'Ext.data.Model',
    fields: [
        'id','name'
    ]
});
Ext.define('Billing', {
    extend: 'Ext.data.Model',
    fields: [
        'billType','description','name','rootId','rootName','billTypeDescr',
        {name: 'billingId', type: 'int'}
    ]
});
Ext.define('BillingInfo', {
    extend: 'Ext.data.Model',
    fields: [
        'callType','callTypeDescr','calleeHead','normalTime','address','billingName','normalTimeDescr','tariffDescr',
        {name: 'billingId', type: 'int'},
        {name: 'beginTime', type: 'int'},
        {name: 'openFlag', type: 'int'},
        {name: 'feeFormula', type: 'int'},
        {name: 'discount', type: 'number'},
        {name: 'tariff', type: 'number'},
        {name: 'beginCount', type: 'int'}
    ]
});
Ext.define('Formula', {
    extend: 'Ext.data.Model',
    fields: [
        'memo',
        {name: 'beginCount', type: 'int'},
        {name: 'beginTime', type: 'int'},
        {name: 'discount', type: 'number'},
        {name: 'formulaId', type: 'int'},
        {name: 'normalCount', type: 'int'},
        {name: 'normalTime', type: 'int'},
        {name: 'semiFlag', type: 'int'},
        {name: 'tariff', type: 'number'}
    ]
});