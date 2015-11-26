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
var errors = require('../util/Errors');
var result = require('../util/Result');
var helper = require('../services/helper');
var services = require('../services');
var util = require('../util/Util');
var errorCode = require('../util/ErrorCodeDesc').errorCode;
var async = require('async');
module.exports = {
    login: function(req, res, next){
        var resp,
            params = {
            name: req.param('name'),
            password: req.param('password')
        };
        async.waterfall([
            function(cb){
                services.admin.get({
                    name: params.name
                }, req.models, {}, cb);
            },
            function(admin, cb){
                var reqPassword = util.md5(params.password + '{' + params.name + '}');
                if(admin == null){
                    resp = new result(errorCode.NOT_FOUND, '用户不存在!');
                }else{
                    if(reqPassword == admin.password){
                        resp = new result(errorCode.SUCCESS, {
                            key: 'admin',
                            value: admin.raw()
                        });
                    }else{
                        resp = new result(errorCode.NO_ACCESS, '用户密码错误!');
                    }
                }
                if(resp.isSuccess()){
                    admin.getRole(function(err, role){
                        if(helper.dbError(err, null) && role != null){
                            resp.addData('role', role.raw());
                        }
                        cb(err, resp);
                    });
                }else{
                    cb(null, resp);
                }
            },
            function(result, cb){
                var role = result.getData('role');
                var admin = result.getData('admin');
                if(admin && role){
                    admin.sys = role.id == 1 ? 1 : 0;
                    if(!role.enable)
                        result.setExecuteResult(errorCode.UN_AUTHORIZED);
                }
                cb(null, result);
            }
        ], function (err, result) {
            if (helper.dbError(err, res)){
                if(result.isSuccess()){
                    req.session.EXTJS_DESKTOP_ROLE = result.getData('role');
                    req.session.EXTJS_DESKTOP_ADMIN = result.getData('admin');
                }
                res.json(result);
            }
        });
    },
    isLogin: function(req, res, next){
        if(req.session && req.session.EXTJS_DESKTOP_ROLE && req.session.EXTJS_DESKTOP_ADMIN){
            var resp = new result(errorCode.SUCCESS, {
                key: 'admin',
                value: req.session.EXTJS_DESKTOP_ADMIN
            }, {
                key: 'role',
                value: req.session.EXTJS_DESKTOP_ROLE
            });
            res.json(resp);
        }else{
            res.json(new result(errorCode.NO_ACCESS, '请登录后操作!'));
        }
    },
    logout: function(req, res, next){
        if(req.session){
            req.session.destroy();
        }
        res.json(new result(errorCode.SUCCESS));
    }
};