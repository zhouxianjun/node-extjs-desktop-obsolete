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
var extObject = require('../util/Object');
var s = function(model){
    return {
        exists: function(params, models, http, cb){
            models[model].exists(params, function(err, exists){
                helper.callback(exists, err, http.res, cb);
            });
        },
        save: function(params, models, http, cb){
            models[model].create(params, function (err, admin) {
                helper.callback(admin, err, http.res, cb);
            });
        },
        get: function(params, models, http, cb){
            models[model].one(params, function (err, admin) {
                helper.callback(admin, err, http.res, cb);
            });
        },
        /**
         * 分页查询数据集
         * @param params pageSize, page
         * @param models
         * @param http
         * @param cb
         */
        pageList: function(params, models, http, cb){
            models[model].count(function(err, count){
                if(helper.dbError(err, http.res)){
                    models[model].all().limit(params.pageSize || count).offset((params.page - 1) * (params.pageSize || count)).run(function(err, list){
                        helper.callback({
                            count: count,
                            list: list
                        }, err, http.res, cb);
                    });
                }
            });
        },
        list: function(params, models, http, cb){
            models[model].find(params, function(err, list){
                helper.callback(list, err, http.res, cb);
            });
        },
        del: function(params, models, http, cb){
            models[model].find(params).remove(function (err) {
                helper.callback(null, err, http.res, cb);
            });
        },
        /**
         * 修改实例对象
         * @param params find 查询条件, update 更改属性
         * @param models
         * @param http
         * @param cb
         */
        update: function(params, models, http, cb){
            models[model].find(params.find, function(err, list){
                if(helper.dbError(err, http.res)) {
                    if (list != null && list.length) {
                        var i = 0;
                        var errors = [];
                        list.forEach(function (item) {
                            extObject.merge(item, params.update);
                            item.save(function (err) {
                                if (err) {
                                    errors.push(item);
                                }
                                i++;
                                if (i >= list.length) {
                                    cb(null, errors);
                                }
                            });
                        });
                    }
                }
            });
        }
    }
};
module.exports = {
    extend: function(model, cfg){
        return extObject.merge({}, s(model), cfg || {});
    }
};