/**
 * Created with JetBrains WebStorm.
 * User: Gary
 * Date: 14-8-20
 * Time: 下午12:11
 * To change this template use File | Settings | File Templates.
 */
var errors = require('../util/Errors');
var h = {
    callback: function(data, err, res, cb){
        var fail, success;
        if(cb.success || cb.fail){
            fail = cb.fail;
            success = cb.success;
        }
        if(h.dbError(err, res, fail || cb)){
            if(typeof success === 'function')
                success(data);
            else if(typeof cb === 'function')
                cb(null, data);
        }
    },
    dbError: function(err, res, cb){
        if(err){
            if(typeof cb === 'function'){
                cb(err);
            }else{
                if(res){
                    res.end(errors.database(err));
                }
            }
            console.error(err);
            return false;
        }else{
            return true;
        }
    }
};
module.exports = h;