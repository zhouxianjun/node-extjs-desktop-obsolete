/**
 * Created by Gary on 2014/9/11.
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
var async = require('async');
var result = require('../util/Result');
var helper = require('../services/helper');
var services = require('../services');
var util = require('../util/Util');
var page = require('../dto/Page');
var errorCode = require('../util/ErrorCodeDesc').errorCode;
var memory = require('../util/Memory');
module.exports = {
    list: function(req, res, next){
        var params = {
            page: req.param('page') || 1,
            pageSize: req.param('pageSize')
        };
        services.role.pageList(params, req.models, {
            req: req,
            res: res
        }, function(err, data){
            res.json(new result(errorCode.SUCCESS, {
                key: 'roles',
                value: new page({
                    pageNum: params.page,
                    pageSize: params.pageSize || data.count,
                    count: data.count,
                    items: data.list
                })
            }));
        });
    },
    addRole: function(req, res, next){
        var name = req.param('name');
        var descr = req.param('descr');
        async.waterfall([
            function(cb){
                services.role.get({
                    name: name
                }, req.models, {
                    req: req,
                    res: res
                }, cb);
            },
            function(role, cb){
                if(role == null){
                    services.role.save({
                        name: name,
                        descr: descr
                    }, req.models, {
                        req: req,
                        res: res
                    }, cb);
                }else{
                    cb(null, null);
                }
            }
        ], function(err, result){
            if(helper.dbError(err, res)){
                if(result == null){
                    res.json(new result(errorCode.EXISTING));
                }else{
                    res.json(new result(errorCode.SUCCESS, {
                        key: 'role',
                        value: result
                    }));
                }
            }
        });
    },
    updateRole: function(req, res, next){
        var name = req.param('name');
        var descr = req.param('descr');
        var id = req.param('id');
        var enable = req.param('enable');
        var tmp = {};
        if(name && id != memory.get('EXTJS_DESKTOP_SYSTEM_ROLE').id){
            tmp.name = name;
        }
        if(descr){
            tmp.descr = descr;
        }
        if(typeof enable !== "undefined"){
            tmp.enable = enable;
        }
        services.role.update({
            id: id,
            update: tmp
        }, req.models, {
            req: req,
            res: res
        }, function(err, fails){
            if(fails == null || !fails.length){
                res.json(new result(errorCode.SUCCESS));
            }else{
                res.json(new result(errorCode.FAIL, {
                    key: 'errors',
                    value: fails
                }));
            }
        });
    },
    deleteRole: function(req, res, next){
        var id = req.param('id');
        if(id != memory.get('EXTJS_DESKTOP_SYSTEM_ROLE').id){
            services.role.del({
                id: id
            }, req.models, {
                req: req,
                res: res
            }, {
                success: function(){
                    res.json(new result(errorCode.SUCCESS));
                }
            });
        }else{
            res.json(new result(errorCode.FAIL, '系统角色禁止删除'));
        }
    }
};