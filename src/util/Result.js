/**
 * Created with JetBrains WebStorm.
 * User: Gary
 * Date: 14-8-21
 * Time: 下午12:28
 * To change this template use File | Settings | File Templates.
 *                 _ooOoo_
 *                o8888888o
 *                88" . "88
 *                (| -_- |)
 *                O\  =  /O
 *             ____/`---'\____
 *           .'  \\|     |//  `.
 *           /  \\|||  :  |||//  \
 *           /  _||||| -:- |||||-  \
 *           |   | \\\  -  /// |   |
 *           | \_|  ''\---/''  |   |
 *           \  .-\__  `-`  ___/-. /
 *         ___`. .'  /--.--\  `. . __
 *      ."" '<  `.___\_<|>_/___.'  >'"".
 *     | | :  `- \`.;`\ _ /`;.`/ - ` : | |
 *     \  \ `-.   \_ __\ /__ _/   .-` /  /
 *======`-.____`-.___\_____/___.-`____.-'======
 *                   `=---='
 *^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *           佛祖保佑       永无BUG
 */
var obj = require('./Object');
var err = require('./ErrorCodeDesc');
var errorCode = err.errorCode;
var errorDesc = err.errorDesc;
var result = function(){
    obj.merge(this, {
        success: false,
        data: {},
        msg: '',
        executeResult: {
            result: errorCode.FAIL,
            resultMsg: errorDesc.FAIL
        }
    });
    if(arguments && arguments.length){
        for(var i = 0; i < arguments.length; i++){
            if(obj.isBoolean(arguments[i])){
                this.success = arguments[i];
            }else if(obj.isObject(arguments[i]) && arguments[i].key && obj.isString(arguments[i].key) && arguments[i].value){
                this.data[arguments[i].key] = arguments[i].value;
            }else if(obj.isString(arguments[i])){
                this.msg = arguments[i];
            }else if(obj.isObject(arguments[i])){
                obj.merge(this, arguments[i] || {});
            }else if(obj.isNumber(arguments[i])){
                this.setExecuteResult(arguments[i]);
            }
        }
    }
};
/*result.prototype.toJSON = function(){
    return JSON.stringify(this);
};*/
result.prototype.isSuccess = function(){
    return this.success;
};
result.prototype.setExecuteResult = function(executeResult){
    if(obj.isObject(executeResult)){
        this.executeResult = executeResult;
    }else if(obj.isNumber(executeResult)){
        this.executeResult = {
            result: executeResult,
            resultMsg: errorCode.getDesc(executeResult)
        };
    }
    this.success = this.executeResult.result == errorCode.SUCCESS;
};
result.prototype.addData = function(key, value){
    this.data[key] = value;
};
result.prototype.getData = function(key){
    return this.data[key];
};
module.exports = result;