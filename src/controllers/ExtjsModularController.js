/**
 * Created with JetBrains WebStorm.
 * User: Gary
 * Date: 14-8-19
 * Time: 下午6:29
 * To change this template use File | Settings | File Templates.
 */
var errors = require('../util/Errors');
var result = require('../util/Result');
var memory = require('../util/Memory');
var helper = require('../services/helper');
var services = require('../services');
var util = require('../util/Util');
var page = require('../dto/Page');
var path = require('path');
var fs = require('fs');
var multiparty = require('multiparty');
var errorCode = require('../util/ErrorCodeDesc').errorCode;
module.exports = {
    list: function(req, res, next){
        services.role.modulars({
            id: req.session.EXTJS_DESKTOP_ROLE.id
        }, req.models, {
            req: req,
            res: res
        }, function(err, modulars){
            res.json(new result(errorCode.SUCCESS, {
                key: 'modulars',
                value: modulars || []
            }));
        });
    },
    all: function(req, res, next){
        var params = {
            page: req.param('page') || 1,
            pageSize: req.param('pageSize')
        };
        services.modular.pageList(params, req.models, {
            req: req,
            res: res
        }, function(err, data){
            if(helper.dbError(err, res)){
                var contextPath = req.app.get('context path');
                var config = memory.get('EXTJS_DESKTOP_CONFIG');
                var modularPath = path.normalize(contextPath + '/' + config.modularPath);
                services.modular.checkLocal(data.list, modularPath, config.com, contextPath + '/' + config.iconPath);
                res.json(new result(errorCode.SUCCESS, {
                    key: 'modulars',
                    value: new page({
                        pageNum: params.page,
                        pageSize: params.pageSize || data.count,
                        count: data.count,
                        items: data.list
                    })
                }));
            }
        });
    },
    modularFiles: function(req, res, next){
        var contextPath = req.app.get('context path');
        var config = memory.get('EXTJS_DESKTOP_CONFIG');
        var modularPath = path.normalize(contextPath + '/' + config.modularPath);
        var files = util.getFiles(modularPath);
        var arr = [];
        for(var i = 0; i < files.length; i++){
            var name = files[i].replace(config.com + '.', '').replace('.js', '');
            arr.push({
                id: name
            });
        }
        res.json(new result(errorCode.SUCCESS, {
            key: 'modularFiles',
            value: arr
        }));
    },
    addModular: function(req, res, next){
        var form = new multiparty.Form();
        form.parse(req, function(err, fields, files) {
            if(helper.dbError(err, res)){
                var name = fields.name;
                var modularIdentifer = fields.modularIdentifer;
                var create = fields.create;
                services.modular.exists({
                    modularIdentifer: modularIdentifer
                }, req.models, {
                    req: req,
                    res: res
                }, function(err, exists){
                    if(helper.dbError(err, res)){
                        if(exists){
                            res.json(new result(errorCode.EXISTING, '[' + modularIdentifer + ']该模块已存在'));
                        }else{
                            var icon = files.icon && files.icon.length > 0 && files.icon[0].size > 0 ? files.icon[0] : null;
                            var suffix = icon != null ? icon.originalFilename.substr(icon.originalFilename.lastIndexOf('.')) : '';
                            var modular = {
                                modularIdentifer: modularIdentifer,
                                name: name,
                                icon: modularIdentifer + '-' + new Date().Format('yyyyMMddhhmmss') + suffix
                            };
                            services.modular.save(modular, req.models, {
                                req: req,
                                res: res
                            }, function(err, m){
                                if(helper.dbError(err, res)){
                                    var contextPath = req.app.get('context path');
                                    var config = memory.get('EXTJS_DESKTOP_CONFIG');
                                    var modularPath = path.normalize(contextPath + '/' + config.modularPath);
                                    if(icon != null){
                                        services.modular.generateIcon(m, contextPath, config.com, config.iconPath, suffix, icon);
                                    }
                                    m = services.modular.checkLocal(m, modularPath, config.com);
                                    if(!m.local && create){
                                        //生成模块
                                        var mfpath = path.normalize(contextPath + '/' + config.functionPath + '/' + m.modularIdentifer);
                                        if(!fs.existsSync(mfpath)){
                                            fs.mkdirSync(mfpath);
                                        }
                                        services.modular.generate(m, path.normalize(process.cwd() + '/Modular.tpl'), modularPath + '/' + config.com + '.' + m.modularIdentifer + '.js');
                                    }
                                    res.json(new result(errorCode.SUCCESS));
                                }
                            });
                        }
                    }
                });
            }
        });
    },
    updateModular: function(req, res, next){
        var form = new multiparty.Form();
        form.parse(req, function(err, fields, files) {
            if (helper.dbError(err, res)) {
                services.modular.get({
                    id: fields.id
                }, req.models, {
                    req: req,
                    res: res
                }, function(err, modular){
                    if (helper.dbError(err, res)) {
                        if(modular == null){
                            res.json(new result(errorCode.NOT_FOUND));
                        }else{
                            var icon = files.updateIcon && files.updateIcon.length > 0 && files.updateIcon[0].size > 0 ? files.updateIcon[0] : null;
                            var suffix = icon != null ? icon.originalFilename.substr(icon.originalFilename.lastIndexOf('.')) : '';
                            if(icon != null){
                                var contextPath = req.app.get('context path');
                                var config = memory.get('EXTJS_DESKTOP_CONFIG');
                                services.modular.deleteIcon(modular, contextPath, config.iconPath);
                                services.modular.generateIcon(modular, contextPath, config.com, config.iconPath, suffix, icon);
                                modular.icon = modular.modularIdentifer + '-' + new Date().Format('yyyyMMddhhmmss') + suffix;
                            }
                            modular.name = fields.name;
                            modular.save(function(err){
                                if (helper.dbError(err, res)) {
                                    res.json(new result(errorCode.SUCCESS));
                                }
                            });
                        }
                    }
                });
            }
        });
    },
    deleteModular: function(req, res, next){
        services.modular.get({
            modularIdentifer: req.param('modularId')
        }, req.models, {
            req: req,
            res: res
        }, function(err, modular){
            if(helper.dbError(err, res)){
                if(modular == null){
                    res.json(new result(errorCode.NOT_FOUND));
                }else{
                    var contextPath = req.app.get('context path');
                    var config = memory.get('EXTJS_DESKTOP_CONFIG');
                    services.modular.deleteUnit(services, modular, req.models, contextPath, config, {
                        req: req,
                        res: res
                    }, function(err){
                        if(err == null){
                            res.json(new result(errorCode.SUCCESS));
                        }
                    });
                }
            }
        });
    },
    generateModular: function(req, res, next){
        services.modular.get({
            id: req.param('id')
        }, req.models, {
            req: req,
            res: res
        }, function(err, modular){
            if(helper.dbError(err, res)){
                if(modular == null){
                    res.json(new result(errorCode.NOT_FOUND));
                }else{
                    var contextPath = req.app.get('context path');
                    var config = memory.get('EXTJS_DESKTOP_CONFIG');
                    var modularPath = path.normalize(contextPath + '/' + config.modularPath);
                    var mfpath = path.normalize(contextPath + '/' + config.functionPath + '/' + modular.modularIdentifer);
                    if(!fs.existsSync(mfpath)){
                        fs.mkdirSync(mfpath);
                    }
                    services.modular.generate(modular, path.normalize(process.cwd() + '/Modular.tpl'), modularPath + '/' + config.com + '.' + modular.modularIdentifer + '.js');
                    res.json(new result(errorCode.SUCCESS));
                }
            }
        });
    }
};