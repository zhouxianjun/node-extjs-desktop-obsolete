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
var result = require('../util/Result');
var async = require('async');
var memory = require('../util/Memory');
var path = require('path');
var helper = require('../services/helper');
var services = require('../services');
var util = require('../util/Util');
var extObject = require('../util/Object');
var uuid = require('node-uuid');
var page = require('../dto/Page');
var errorCode = require('../util/ErrorCodeDesc').errorCode;
var children = function(parentId, req, res, cb){
    services.function.children({
        id: parentId
    }, req.models, {
        req: req,
        res: res
    }, cb);
};
module.exports = {
    list: function(req, res, next){
        var modularIdentifer = req.param('modularIdentifer');
        var parentId = req.param('parentId');
        var parseFunctions = function(functions){
            if(functions == null){
                res.json([]);
                return;
            }
            services.role.functions({
                id: req.session.EXTJS_DESKTOP_ROLE.id
            }, req.models, {
                req: req,
                res: res
            }, function(err, roleFunctions){
                var funcs = services.function.checkAuth(functions, roleFunctions);
                var contextPath = req.app.get('context path');
                var config = memory.get('EXTJS_DESKTOP_CONFIG');
                var functionPath = path.normalize(contextPath + '/' + config.functionPath + '/' + modularIdentifer);
                funcs = services.function.checkLocals(functions, functionPath);
                res.json(funcs);
            });
        };
        if(!parentId || parentId == null){
            services.modular.functions({
                modularIdentifer: modularIdentifer
            }, req.models, {
                req: req,
                res: res
            }, function(err, functions){
                parseFunctions(functions);
            });
        }else{
            children(parentId, req, res, function(err, functions){
                parseFunctions(functions);
            });
        }
    },
    children: function(req, res, next){
        children(req.param('parentId'), req, res, function(err, functions){
            res.json(functions || []);
        });
    },
    allAuth: function(req, res, next){
        var roleId = req.param('roleId');
        if(!roleId){
            res.json([]);
        }else{
            async.parallel({
                allModulars: function(cb){
                    services.modular.list({}, req.models, {
                        req: req,
                        res: res
                    }, cb);
                },
                role: function(cb){
                    services.role.get({
                        id: roleId
                    }, req.models, {
                        req: req,
                        res: res
                    }, cb);
                }
            }, function(err, result){
                if(helper.dbError(err, res)){
                    if(result.role == null || result.allModulars == null){
                        res.json([]);
                        return;
                    }
                    async.parallel({
                        roleModulars: function(cb){
                            result.role.getModulars(cb);
                        },
                        roleFunctions: function(cb){
                            result.role.getFunctions(cb);
                        }
                    }, function(err, results){
                        if(helper.dbError(err, res)) {
                            if(!results.roleModulars){
                                results.roleModulars = [];
                            }
                            var functions = [];
                            for(var k = 0; k < result.allModulars.length; k++){
                                var modular = result.allModulars[k];
                                var func = {
                                    checked: false
                                };
                                for(var i = 0; i < results.roleModulars.length; i++){
                                    if(modular.id == results.roleModulars[i].id){
                                        func.checked = true;
                                        continue;
                                    }
                                }
                                func.children = modular;
                                func.parent = true;
                                func.id = 'modular#' + modular.modularIdentifer;
                                func.text = modular.name;
                                functions.push(func);
                            }
                            if(!functions.length){
                                res.json(functions);
                            }
                            for(var i = 0; i < functions.length; i++){
                                (function(k){
                                    var func = functions[k];
                                    var task = {};
                                    /*function xx(data){

                                        for(var i = 0; i < data.length; i++){
                                            task['task_' + uuid()] = (function(k){
                                                return function(cb){
                                                    data[k].getChildren(function(err, arr){
                                                        data[k].children = arr;
                                                        cb(err, null);
                                                    });
                                                }
                                            })(i);
                                        }
                                    }*/
                                    func.children.getFunctions(function (err, data){
                                        if(helper.dbError(err, res)){
                                            if(results.roleFunctions == null || !results.roleFunctions.length){
                                                functions[k].children = data;
                                                if(k >= functions.length - 1){
                                                    res.json(functions);
                                                }
                                            }else{
                                                functions[k].children = services.function.checkedAuth(data, results.roleFunctions, function(funcs){
                                                    if(k >= functions.length - 1){
                                                        res.json(funcs);
                                                    }
                                                });
                                            }
                                        }
                                    });
                                })(i);
                            }
                        }
                    });
                }
            });
        }
    },
    setAuth: function(req, res, next){
        var array = JSON.parse(req.param('modular') || '[]');
        var funcArray = JSON.parse(req.param('functions') || '[]');
        services.role.get({
            id: req.param('roleId')
        }, req.models, {
            req: req,
            res: res
        }, function(err, role){
            if(helper.dbError(err, res)){
                async.parallel({
                    modular: function(cb){
                        var tasks = {};
                        for(var i = 0; i < array.length; i++){
                            tasks['task_' + i] = (function(x){
                                return function(cb){
                                    services.modular.get({
                                        modularIdentifer: array[x]
                                    }, req.models, {
                                        req: req,
                                        res: res
                                    }, cb);
                                }
                            })(i);
                        }
                        var res = {
                            ms: [],
                            nms: []
                        };
                        async.parallel(tasks, function(err, results){
                            if(helper.dbError(err, res)){
                                for(var k in results){
                                    var m = results[k];
                                    if(m != null){
                                        res.ms.push(m);
                                    }else{
                                        res.nms.push(k);
                                    }
                                }
                                cb(null, res);
                            }
                        });
                    },
                    func: function(cb){
                        var tasks = {};
                        for(var i = 0; i < funcArray.length; i++){
                            tasks['task_' + i] = (function(x){
                                return function(cb){
                                    services.function.get({
                                        fid: funcArray[x]
                                    }, req.models, {
                                        req: req,
                                        res: res
                                    }, cb);
                                }
                            })(i);
                        }
                        var res = {
                            fs: [],
                            nfs: []
                        };
                        async.parallel(tasks, function(err, results){
                            if(helper.dbError(err, res)){
                                for(var k in results){
                                    var f = results[k];
                                    if(f != null){
                                        res.fs.push(f);
                                    }else{
                                        res.nfs.push(k);
                                    }
                                }
                                cb(null, res);
                            }
                        });
                    }
                }, function(err, results){
                    if(helper.dbError(err, res)){
                        var ms = results.modular.ms;
                        var fs = results.func.fs;
                        var tasks = {
                            ms: function(cb){
                                role.setModulars(ms, cb);
                            },
                            fs: function(cb){
                                role.setFunctions(fs, cb);
                            }
                        };
                        async.parallel(tasks, function(err, results2){
                            if(helper.dbError(err, res)){
                                var reso = new result(errorCode.SUCCESS, {
                                    key: 'noFunction',
                                    value: results.func.nfs
                                }, {
                                    key: 'noModular',
                                    value: results.modular.nms
                                });
                                res.json(reso);
                            }
                        });
                    }
                });
            }
        });
    },
    functionFiles: function(req, res, next){
        var contextPath = req.app.get('context path');
        var config = memory.get('EXTJS_DESKTOP_CONFIG');
        var functionPath = path.normalize(contextPath + '/' + config.functionPath + '/' + req.param('modularId'));
        var files = util.getFiles(functionPath);
        var arr = [];
        for(var i = 0; i < files.length; i++){
            var name = files[i].replace('.js', '');
            arr.push({
                id: name
            });
        }
        res.json(new result(errorCode.SUCCESS, {
            key: 'functionFiles',
            value: arr
        }));
    },
    addFunction: function(req, res, next){
        var funcId = req.param('extjsId');
        var modularIdentifer = req.param('modularIdentifer');
        var parentId = req.param('parentId');
        var text = req.param('text');
        var create = req.param('create');
        var modularId = req.param('modularId');
        var newFunction = null;
        function work(err, d){
            if(helper.dbError(err, res) && funcId && create && newFunction != null && modularId){
                //生成
                var contextPath = req.app.get('context path');
                var config = memory.get('EXTJS_DESKTOP_CONFIG');
                var functionPath = path.normalize(contextPath + '/' + config.functionPath);
                services.function.generate(newFunction, path.normalize(process.cwd() + '/Function.tpl'), functionPath + '/' + modularId + '/' + newFunction.id + '.js');
            }
            res.json(new result(errorCode.SUCCESS));
        }
        services.function.get({
            id: funcId
        }, req.models, {
            req: req,
            res: res
        }, function(err, func){
            if(helper.dbError(err, res)){
                if(func == null){
                    if(modularIdentifer){
                        services.modular.get({
                            modularIdentifer: modularIdentifer
                        }, req.models, {
                            req: req,
                            res: res
                        }, function(err, modular){
                            if(helper.dbError(err, res)){
                                if(modular){
                                    services.function.save({
                                        id: funcId,
                                        text: text
                                    }, req.models, {
                                        req: req,
                                        res: res
                                    }, function(err, newFunc){
                                        if(helper.dbError(err, res)){
                                            async.parallel({
                                                func: function(cb){
                                                    newFunc.addModulars(modular, cb);
                                                }/*,
                                                modular: function(cb){
                                                    modular.addFunctions(newFunc, cb);
                                                }*/
                                            }, work);
                                        }
                                    });
                                }else{
                                    res.json(new result(errorCode.NOT_FOUND));
                                }
                            }
                        });
                    }else if(parentId){
                        services.function.get({
                            fid: parentId
                        }, req.models, {
                            req: req,
                            res: res
                        }, function(err, func2){
                            if(helper.dbError(err, res)){
                                services.function.save({
                                    id: funcId,
                                    text: text
                                }, req.models, {
                                    req: req,
                                    res: res
                                }, function(err, newFunc){
                                    if(helper.dbError(err, res)){
                                        func2.id = func2.fid + '';
                                        func2.save(function(err){
                                            if(helper.dbError(err, res)){
                                                func2.addChildren(newFunc, work);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }else{
                    res.json(new result(errorCode.EXISTING, '[' + funcId + ']该功能已存在'));
                }
            }
        });
    },
    deleteFunction: function(req, res, next){
        var fid = req.param('fid');
        services.function.get({
           fid: fid
        }, req.models, {
            req: req,
            res: res
        }, function(err, func){
            if(helper.dbError(err, res)){
                if(func != null){
                    var contextPath = req.app.get('context path');
                    var config = memory.get('EXTJS_DESKTOP_CONFIG');
                    services.function.deleteUnit(services, func, req.models, contextPath, config, {
                        req: req,
                        res: res
                    }, function(err){
                        if(err == null){
                            res.json(new result(errorCode.SUCCESS));
                        }
                    });
                }else{
                    res.json(new result(errorCode.NOT_FOUND));
                }
            }
        });
    }
};