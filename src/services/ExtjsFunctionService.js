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
var async = require('async');
var helper = require('./helper');
var util = require('../util/Util');
var abstract = require('./AbstractService');
var fs = require('fs');
var path = require('path');
module.exports = abstract.extend('ExtjsFunction', {
    /**
     * 获取下级功能
     * @param params 获取一个function的参数
     * @param models
     * @param http
     * @param cb
     */
    children: function(params, models, http, cb){
        this.get(params, models, http, function(err, fun){
            if(fun != null){
                fun.getChildren(function(err, children){
                    helper.callback(children, err, http.res, cb);
                });
            }else{
                cb(null, []);
            }
        });
    },
    /**
     * 根据角色排除该角色不包含的功能
     * @param functions 所有功能
     * @param roleFunctions 角色的功能
     * @returns {Array}
     */
    checkAuth: function(functions, roleFunctions){
        var funs = [];
        for(var i = 0; i < functions.length; i++){
            var fun = functions[i];
            for(var i = 0; i < roleFunctions.length; i++){
                var roleFun = roleFunctions[i];
                if(fun.fid == roleFun.fid){
                    funs.push(fun);
                }
            };
        };
        return funs;
    },
    checkedAuth: function(functions, roleFunctions, callback){
        if(functions != null && roleFunctions != null){
            for(var i = 0; i < functions.length; i++){
                for(var j = 0; j < roleFunctions.length; j++){
                    if(functions[i].fid == roleFunctions[j].fid){
                        functions[i].checked = true;
                        async.parallel({
                            my: function(cb){
                                functions[i].getChildrens(cb);
                            },
                            role: function(cb){
                                roleFunctions[j].getChildrens(cb);
                            }
                        }, function(err, results){
                            functions[i].children = this.checkedAuth(results.my, results.role);
                        });
                    }
                }
            }
        }else{
            callback(functions);
        }
    },
    /**
     * 排除本地不存在的功能
     * @param functions
     * @param path
     * @returns {Array}
     */
    checkLocals: function(functions, fpath){
        var funs = [];
        for(var i = 0; i < functions.length; i++){
            var fun = functions[i];
            var local = fs.existsSync(path.normalize(fpath + '/' + fun.id + '.js'));
            if(local || !fun.leaf){
                funs.push(fun);
            }
        };
        return funs;
    },
    /**
     * 生成功能（function）JS
     * @param func 功能
     * @param tplPath 模板
     * @param webPath web存放地址
     */
    generate: function(func, tplPath, webPath){
        var tpl = fs.readFileSync(tplPath).toString();
        tpl.replaceAll('{functionIdentifer}', func.id);
        tpl.replaceAll('{functionName}', func.text);
        fs.writeFileSync(webPath, tpl);
    },
    /**
     * 删除一个功能（删除模块的所有关联关系）
     * @param service
     * @param func 功能对象
     * @param models
     * @param contextPath
     * @param config
     * @param http
     * @param callback
     */
    deleteUnit: function(service, func, models, contextPath, config, http, callback){
        service.role.list({}, models, http, function(err, roles){
            if(helper.dbError(err, http.res, callback)){
                var task = {};
                for(var i = 0; i < roles.length; i++){
                    task['task_' + i] = (function(roleId, funcId){
                        return function(cb){
                            service.role.deleteFuction(service, {
                                functionId: funcId,
                                roleId: roleId
                            }, models, http, cb);
                        }
                    })(roles[i].id, func.id);
                }
                task['task_modulars'] = function(cb){
                    func.getModulars(cb);
                };
                async.parallel(task, function(err, result) {
                    if (helper.dbError(err, http.res, callback)) {
                        task = {};
                        for(var i = 0; i < result.task_modulars.length; i++){
                            task['task_' + i] = (function(funcId, modularIdentifer, modular){
                                return function(cb){
                                    service.modular.deleteFuction(service, {
                                        functionId: funcId,
                                        modularIdentifer: modularIdentifer,
                                        modular: modular
                                    }, models, http, cb);
                                }
                            })(func.id, result.task_modulars[i].modularIdentifer, result.task_modulars[i]);

                            fs.unlinkSync(path.normalize(contextPath + '/' + config.functionPath + '/' + result.task_modulars[i].modularIdentifer + '/' + func.id + '.js'));
                        }
                        async.parallel(task, function(err, result) {
                            if (helper.dbError(err, http.res, callback)) {
                                func.remove(function(err){
                                    if(helper.dbError(err, null, callback)){
                                        callback();
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    }
});