/**
 * Created with JetBrains WebStorm.
 * User: Gary
 * Date: 14-8-19
 * Time: 下午5:48
 * To change this template use File | Settings | File Templates.
 */
module.exports = {
    admin: require('./ExtjsAdminController'),
    modular: require('./ExtjsModularController'),
    function: require('./ExtjsFunctionController'),
    role: require('./ExtjsRoleController'),
    gzip: require('./GzipController')
};