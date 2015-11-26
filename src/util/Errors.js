/**
 * Created with JetBrains WebStorm.
 * User: Gary
 * Date: 14-8-20
 * Time: 上午10:06
 * To change this template use File | Settings | File Templates.
 */
var obj = require('./Object');
var err = require('./ErrorCodeDesc');
var errorCode = err.errorCode;
var result = require('./Result');
module.exports = {
    exists: function(msg){
        return new result(11, msg || '该数据已存在');
    },
    database: function(err){
        return new result(errorCode.UNKNOWN_ERROR);
    },
    notFound: function(msg){
        return new result(errorCode.NOT_FOUND, msg);
    }
};