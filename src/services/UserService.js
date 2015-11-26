/**
 * Created with JetBrains WebStorm.
 * User: Gary
 * Date: 14-8-20
 * Time: 下午5:42
 * To change this template use File | Settings | File Templates.
 */
var async = require('async');
var helper = require('../services/helper');
var util = require('../util/Util');
module.exports = {
    /**
     * 注册用户,初始化用户属性
     * @param req
     * @param res
     */
    reg: function(req, res){
        // 开启事务控制
        req.db.transaction(function (err, t) {
            try{
                if (helper.dbError(err, res)){
                    //同步执行
                    async.waterfall([
                        /**
                         * 创建用户User
                         * @param cb
                         */
                        function(cb){
                            req.models.User.create({
                                name: req.query.name,
                                password: util.md5(req.query.password + '{' + req.query.name + '}'),
                                email: req.query.email
                            }, function (err, user) {
                                cb(err, user);
                            });
                        },
                        /**
                         * 创建用户扩展Extend
                         * @param user
                         * @param cb
                         */
                        function(user, cb){
                            req.models.Extend.create({
                                nickName: req.query.name
                            }, function(err, userExt){
                                if (helper.dbError(err, res, cb)){
                                    //关联用户扩展
                                    user.userext_id = userExt.id;
                                    user.save(function(err){
                                        cb(err, user);
                                    });
                                }
                            });
                        },
                        /**
                         * 创建登录属性Login
                         * @param user
                         * @param cb
                         */
                        function(user, cb){
                            req.models.Login.create({
                                level: 0,
                                totalOnlineHour: 0
                            }, function(err, login){
                                if (helper.dbError(err, res, cb)){
                                    //关联用户登录属性
                                    user.login_id = login.id;
                                    user.save(function(err){
                                        var data = {
                                            user: user,
                                            login: login
                                        };
                                        cb(err, user);
                                    });
                                }
                            });
                        },
                        /**
                         * 创建用户注册地址信息
                         * @param user
                         * @param cb
                         */
                        function(user, cb){
                            util.getIpInfo(req.query.ip, function(json){
                                if(json){
                                    req.models.Area.create({
                                        city: json.city,
                                        country: json.country,
                                        countrySN: json.country_id,
                                        province: json.region,
                                        provinceSN: json.region_id,
                                        citySN: json.city_id,
                                        isp: json.isp,
                                        ip: json.ip
                                    }, function(err, area){
                                        if (helper.dbError(err, res, cb)){
                                            //关联用户IP地址属性
                                            user.area_id = area.id;
                                            user.save(function(err){
                                                cb(err, user);
                                            });
                                        }
                                    });
                                }else{
                                    cb(null, user);
                                }
                            });
                        },
                        /**
                         * 创建用户默认好友组
                         * @param user
                         * @param cb
                         */
                        function(user, cb){
                            req.models.Group.create({
                                name: '我的好友',
                                state: 1,
                                user_id: user.id
                            }, function(err, group){
                                user.addGroup(group, function(err){
                                    cb(err, user);
                                });
                            });
                        },
                        /**
                         * 提交事务
                         * @param result
                         * @param cb
                         */
                        function(result, cb){
                            t.commit(function(err){
                                cb(null, result);
                            });
                        }
                    ], function (err, result) {
                        if (helper.dbError(err, res)){
                            res.end('ok');
                            console.log(result);
                        }else{
                            // 回滚事务
                            t.rollback(function(){});
                        }
                    });
                }
            }catch (err){
                t.rollback(function(){});
                console.error('注册用户失败!' + err);
            }
        });
    },
    one: function(req, res, cb){
        req.models.User.one({
            or: [{
                name: req.query.name
            }, {
                email: req.query.email
            }]
        }, function(err, user){
            if(helper.dbError(err, res)){
                cb(user);
            }
        });
    },
    full: function(req, res, cb){
        this.one(req, res, function(user){
            if(user == null){
                cb(user);
            }else{
                var tasks = {
                    ext: function(cb){
                        user.getUserExt(function(err, ext){
                            if(helper.dbError(err, res, cb)){
                                cb(null, ext);
                            }
                        });
                    },
                    groups: function(cb){
                        user.getGroup(function(err, groups){
                            if(helper.dbError(err, res, cb)){
                                console.log(groups);
                                cb(null, groups);
                            }
                        });
                    },
                    login: function(cb){
                        user.getLogin(function(err, login){
                            if(helper.dbError(err, res, cb)){
                                cb(null, login);
                            }
                        });
                    },
                    area: function(cb){
                        user.getArea(function(err, area){
                            if(helper.dbError(err, res, cb)){
                                cb(null, area);
                            }
                        });
                    },
                    chats: function(cb){
                        user.getChat(function(err, chats){
                            if(helper.dbError(err, res, cb)){
                                cb(null, chats);
                            }
                        });
                    }
                };
                //多个函数并行异步执行
                async.parallel(tasks, function(err, results){
                    if (helper.dbError(err, res)){
                        var resultUser = user.raw();
                        resultUser.ext = results.ext.raw();
                        resultUser.login = results.login.raw();
                        resultUser.area = results.area.raw();
                        resultUser.chats = [];
                        resultUser.groups = [];
                        if(results.chats && results.chats.length){
                            for(var i = 0; i < results.chats.length; i++){
                                resultUser.chats[i] = results.chats[i].raw();
                            }
                        }
                        if(results.groups && results.groups.length){
                            for(var i = 0; i < results.groups.length; i++){
                                resultUser.groups[i] = results.groups[i].raw();
                            }
                        }
                        cb(resultUser);
                    }
                });
            }
        });
    }
};