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
var result = require('../util/Result');
var errorCode = require('../util/ErrorCodeDesc').errorCode;
var fs = require('fs');
var path = require('path');
module.exports = abstract.extend('ExtjsModular', {
    /**
     * 获取模块下的功能
     * @param params modularIdentifer 模块id
     * @param models
     * @param http
     * @param cb
     */
    functions: function(params, models, http, cb){
        this.get(params, models, http, function(err, modular){
            if(helper.dbError(err, http.res)){
                if(modular != null){
                    modular.getFunctions(function(err, functions){
                        helper.callback(functions, err, http.res, cb);
                    });
                }else{
                    cb(null, null);
                }
            }
        });
    },
    /**
     * 删除一个功能
     * @params service service对象
     * @params params functionId:功能Id, modularIdentifer:模块标识, modular:模块对象
     */
    deleteFuction: function(service, params, models, http, callback){
        var me = this;
        async.parallel({
            func: function(cb){
                service.function.get({
                    id: params.functionId
                }, models, http, cb);
            },
            modularFunctions: function(cb){
                me.functions({
                    modularIdentifer: params.modularIdentifer
                }, models, http, cb);
            },
            modular: function(cb){
                me.get({
                    modular: params.modular
                }, models, http, cb);
            }
        }, function(err, results){
            if (helper.dbError(err, http.res)){
                var func = results.func,
                    modularFunctions = results.modularFunctions,
                    modular = results.modular;
                if(modularFunctions && modularFunctions.length && func && modular){
                    async.waterfall([
                        function(cb){
                            modularFunctions.forEach(function(item){
                                if(item.fid == func.fid){
                                    cb(null, item);
                                }
                            });
                        },
                        function(item, cb){
                            modular.removeFunctions(item, function(err){
                                cb(err, func);
                            });
                        },
                        function(func, cb){
                            func.getChildren(cb);
                        },
                        function(funcs, cb){
                            if(funcs && funcs.length){
                                funcs.forEach(function(item){
                                    me.deleteFuction(service, {
                                        functionId: item.fid,
                                        modularIdentifer: params.modularIdentifer
                                    }, models, http, callback);
                                });
                            }else{
                                cb(null, null);
                            }
                        }
                    ], callback);
                }else{
                    callback(null, new result(errorCode.NOT_FOUND));
                }
            }
        });
    },
    /**
     * 检查模块JS以及图标是否本地存在
     * @params modular 模块对象
     * @params p 模块地址
     * @params com
     * @params iconPath 图标
     */
    checkLocal: function(modular, p, com, iconPath){
        if(modular.length){
            for(var i = 0; i < modular.length; i++){
                modular[i] = this.checkLocal(modular[i], p, com, iconPath);
            }
        }else {
            var name = com + '.' + modular.modularIdentifer + '.js';
            modular.local = fs.existsSync(path.normalize(p + '/' + name));
            var indexOf = modular.icon ? modular.icon.lastIndexOf('.') : -1;
            if(modular.icon && indexOf != -1 && iconPath){
                var max = modular.icon.substr(0, indexOf) + '-46' + modular.icon.substr(indexOf);
                var min = modular.icon.substr(0, indexOf) + '-16' + modular.icon.substr(indexOf);
                modular.iconLocal = fs.existsSync(path.normalize(iconPath + '/' + max)) && fs.existsSync(path.normalize(iconPath + '/' + min));
            }
            return modular;
        }
    },
    /**
     * 生成模块JS
     * @params modular 模块对象
     * @params tplPath 模板
     * @params webPath web存放地址
     */
    generate: function(modular, tplPath, webPath){
        var tpl = fs.readFileSync(tplPath).toString();
        tpl = tpl.replaceAll("{modularIdentifer}", modular.modularIdentifer);
        tpl = tpl.replaceAll("{modularName}", modular.name);
        return fs.writeFileSync(webPath, tpl);
    },
    generateIcon: function(modular, contextPath, com, iconPath, suffix, icon){
        var iconName = modular.modularIdentifer + '-' + new Date().Format('yyyyMMddhhmmss');
        var tpl = fs.readFileSync(path.normalize(process.cwd() + '/Modular-Icon.tpl')).toString();
        tpl = tpl.replaceAll("{modularIdentifer}", modular.modularIdentifer);
        tpl = tpl.replaceAll("{com}", com);
        tpl = tpl.replaceAll("{path}", iconPath);
        tpl = tpl.replaceAll("{suffix}", suffix);
        tpl = tpl.replaceAll("{icon}", iconName);
        tpl = tpl.replaceAll("{max}", 46);
        tpl = tpl.replaceAll("{min}", 16);
        fs.appendFileSync(contextPath + '/css/modular-icon.css', tpl);
        util.resizeImg(icon.path, path.normalize(contextPath + '/' + iconPath + '/' + iconName + '-46' + suffix), 46);
        util.resizeImg(icon.path, path.normalize(contextPath + '/' + iconPath + '/' + iconName + '-16' + suffix), 16);
        try{
            fs.unlinkSync(icon.path);
        }catch (e){}
        iconName += suffix;
        return iconName;
    },
    deleteIcon: function(modular, contextPath, iconPath){
        var tpl = fs.readFileSync(contextPath + '/css/modular-icon.css').toString();
        var indexOf = tpl.indexOf('/**' + modular.modularIdentifer + '-start*/');
        var aStr = '/**' + modular.modularIdentifer + '-end*/';
        var indexOf2 = tpl.indexOf(aStr);
        if(indexOf > -1 && indexOf2 > indexOf){
            var del = tpl.substr(indexOf, indexOf2 + aStr.length);
            tpl = tpl.replace(del, '');
            fs.writeFileSync(contextPath + '/css/modular-icon.css', tpl);
        }
        if(modular.icon){
            var icon = modular.icon;
            var name = icon.substr(0, icon.lastIndexOf('.'));
            var suffix = icon.substr(icon.lastIndexOf('.'));
            try{
                fs.unlinkSync(path.normalize(contextPath + '/' + iconPath + '/' + name + '-46' + suffix));
                fs.unlinkSync(path.normalize(contextPath + '/' + iconPath + '/' + name + '-16' + suffix));
            }catch (e){}
        }
    },
    /**
     * 删除一个模块（删除模块的所有关联关系）
     * @param service
     * @param modular 模块对象
     * @param models
     * @param contextPath
     * @param config
     * @param http
     * @param callback
     */
    deleteUnit: function(service, modular, models, contextPath, config, http, callback){
        var me = this;
        async.parallel({
            modularFuncs: function(cb){
                modular.getFunctions(cb);
            },
            roles: function(cb){
                service.role.list({}, models, http, cb);
            }
        }, function(err, result){
            if(helper.dbError(err, http.res, callback)){
                var roles = result.roles;
                var modularFuncs = result.modularFuncs;
                var task = {};
                for(var i = 0; i < roles.length; i++){
                    for(var k = 0; k < modularFuncs.length; k++){
                        task['task_' + i + '_' + k] = (function(roleId, funcId){
                            return function(cb){
                                service.role.deleteFuction(service, {
                                    functionId: funcId,
                                    roleId: roleId
                                }, models, http, cb);
                            }
                        })(roles[i].id, modularFuncs[k].id);
                    }
                    task['task_modular_' + i] = (function(roleId, modularId){
                        return function(cb){
                            service.role.deleteModular(service, {
                                modularId: modularId,
                                roleId: roleId
                            }, models, http, cb);
                        }
                    })(roles[i].id, modular.id);
                }
                async.parallel(task, function(err, result){
                    if(helper.dbError(err, http.res, callback)){
                        modular.remove(function(err){
                            if(helper.dbError(err, null, callback)){
                                modular = me.checkLocal(modular, contextPath + '/' + config.modularPath, config.com, contextPath + '/' + config.iconPath);
                                if(modular.local){
                                    try{
                                        fs.unlinkSync(path.normalize(contextPath + '/' + config.modularPath + '/' + config.com + '.' + modular.modularIdentifer + '.js'));
                                    }catch (e){}
                                }
                                me.deleteIcon(modular, contextPath, config.iconPath);
                                callback();
                            }
                        });
                    }
                });
            }
        });
    }
});