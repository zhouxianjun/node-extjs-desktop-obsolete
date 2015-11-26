/**
 * Created with JetBrains WebStorm.
 * User: Gary
 * Date: 12-11-29
 * Time: 下午2:44
 * To change this template use File | Settings | File Templates.
 */
// the method:[get|post|all], default is all
var controllers = require('./controllers');

module.exports = function (app) {
    for(var key in controllers){
        for(var k in controllers[key]){
            app.all('/' + key + '/' + k, controllers[key][k]);
        }
    }
};