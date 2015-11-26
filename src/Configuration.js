/**
 * Created by Gary on 2014/9/9.
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
var obj = require('./util/Object');
var util = require('./util/Util');
var memory = require('./util/Memory');
var service = require('./services');
var async = require('async');
var helper = require('./services/helper');
var config = {
    roleName: 'SYSTEM',
    roleDescr: '管理员',
    modularPath: 'desktop/model',
    iconPath: 'icons',
    functionPath: 'desktop/function',
    com: 'Gary'
};
module.exports = function(models, cfg){
    config = obj.merge(config, cfg || {});
    async.waterfall([
        function(cb){
            var tmpcb = {
                success: function(role){
                    if(role == null){
                        service.role.save({
                            name: config.roleName,
                            descr: config.roleDescr
                        }, models, {}, tmpcb);
                    }else{
                        memory.set('EXTJS_DESKTOP_SYSTEM_ROLE', role.raw());
                        cb(null, role);
                    }
                },
                fail: function(err){
                    cb(err);
                }
            };
            service.role.get({
                name: config.roleName
            }, models, {}, tmpcb);
        },
        function(role, cb){
            service.admin.get({}, models, {}, cb);
        },
        function(admin, cb){
            if(admin == null){
                service.admin.save({
                    nickName: '管理员',
                    name: 'admin',
                    password: util.md5('123456{admin}'),
                    role_id: memory.get('EXTJS_DESKTOP_SYSTEM_ROLE').id
                }, models, {}, cb);
            }else{
                cb(null, admin);
            }
        }
    ], function(err, result){
        if (!helper.dbError(err)){
            console.error('Extjs初始化失败!' + err);
            process.exit();
        }else{
            memory.set('EXTJS_DESKTOP_CONFIG', config);
            console.log('Extjs 初始化完成.');
        }
    });
};