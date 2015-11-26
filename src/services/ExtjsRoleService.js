/**
 * Created with JetBrains WebStorm.
 * User: Gary
 * Date: 14-8-20
 * Time: 下午5:42
 * To change this template use File | Settings | File Templates.
 */
var async = require('async');
var helper = require('./helper');
var util = require('../util/Util');
var result = require('../util/Result');
var errorCode = require('../util/ErrorCodeDesc').errorCode;
var abstract = require('./AbstractService');
module.exports = abstract.extend('ExtjsRole', {
    getByName: function(params, models, http, cb){
        models.ExtjsRole.one({
            name: params.name
        }, function(err, role){
            helper.callback(role, err, http.res, cb);
        });
    },
    modulars: function(params, models, http, cb){
        this.get(params, models, http, function(err, role){
            if(helper.dbError(err, http.res)){
                if(role != null){
                    role.getModulars(function(err, modulars){
                        helper.callback(modulars, err, http.res, cb);
                    });
                }else{
                    cb(null, null);
                }
            }
        });
    },
    functions: function(params, models, http, cb){
        this.get(params, models, http, function(err, role){
            if(helper.dbError(err, http.res)){
                if(role != null){
                    role.getFunctions(function(err, functions){
                        helper.callback(functions, err, http.res, cb);
                    });
                }else{
                    cb(null, null);
                }
            }
        });
    },
    deleteFuction: function(service, params, models, http, callback){
        var me = this;
        async.parallel({
            func: function(cb){
                service.function.get({
                    id: params.functionId
                }, models, http, cb);
            },
            roleFunctions: function(cb){
                me.functions({
                    id: params.roleId
                }, models, http, cb);
            },
            role: function(cb){
                me.get({
                    id: params.roleId
                }, models, http, cb);
            }
        }, function(err, results){
            if (helper.dbError(err, http.res)){
                var func = results.func,
                    roleFunctions = results.roleFunctions,
                    role = results.role;
                if(roleFunctions && roleFunctions.length && func && role){
                    async.waterfall([
                        function(cb){
                            var item = null;
                            for(var i = 0; i < roleFunctions.length; i++){
                                if(roleFunctions[i].fid == func.fid){
                                    item = roleFunctions[i];
                                }
                            }
                            cb(null, item);
                        },
                        function(item, cb){
                            if(item != null){
                                role.removeFunctions(item, function(err){
                                    cb(err, func);
                                });
                            }else{
                                cb(null, null);
                            }
                        },
                        function(func, cb){
                            if(func == null){
                                cb(null, null);
                            }else {
                                func.getChildren(cb);
                            }
                        },
                        function(funcs, cb){
                            if(funcs && funcs.length){
                                funcs.forEach(function(item){
                                    me.deleteFuction(service, {
                                        functionId: item.fid,
                                        roleId: params.roleId
                                    }, models, http, callback);
                                });
                            }else{
                                cb(null, null);
                            }
                        }
                    ], callback);
                    /*roleFunctions.forEach(function(item){
                        if(item.fid == func.fid){
                            role.removeFunctions(func, function(err){
                                if(helper.dbError(err, http.res)){
                                    fun.getChildren(function(err, children){
                                        if(helper.dbError(err, http.res)){

                                        }
                                    });
                                }
                            });
                        }
                    });*/
                }else{
                    callback(null, new result(errorCode.NOT_FOUND));
                }
            }
        });
    },
    deleteModular: function(service, params, models, http, callback){
        var me = this;
        async.parallel({
            modular: function(cb){
                service.function.get({
                    id: params.modularId
                }, models, http, cb);
            },
            roleModulars: function(cb){
                me.modulars({
                    id: params.roleId
                }, models, http, cb);
            },
            role: function(cb){
                me.get({
                    id: params.roleId
                }, models, http, cb);
            }
        }, function(err, results){
            if (helper.dbError(err, http.res)){
                var modular = results.modular,
                    roleModulars = results.roleModulars,
                    role = results.role;
                if(roleModulars && roleModulars.length && modular && role){
                    async.waterfall([
                        function(cb){
                            var item = null;
                            for(var i = 0; i < roleModulars.length; i++){
                                if(roleModulars[i].id == modular.id){
                                    item = roleModulars[i];
                                }
                            }
                            cb(null, item);
                        },
                        function(item, cb){
                            if(item != null){
                                role.removeModulars(item, function(err){
                                    cb(err, modular);
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
    }
});
