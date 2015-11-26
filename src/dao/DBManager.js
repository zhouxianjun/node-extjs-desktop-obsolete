/**
 * Created with JetBrains WebStorm.
 * User: Gary
 * Date: 14-8-19
 * Time: 下午2:32
 * To change this template use File | Settings | File Templates.
 */
var orm = require("orm");
var transaction = require("orm-transaction");
var fs = require('fs');
var path = require('path');
var opts = {
    database: "extjs",
    protocol: "mysql",
    host: "188.188.1.52",
    username: "root",
    password: "ihuizhi",
    debug: false,
    query: {
        pool: true
    }
};

var entityPath = '../entity';
var _path = path.join(__dirname, entityPath);

var connection = null;
function initAssociations(db){
    for(var model in db.models){
        var m = db.models[model];
        if(typeof m.associations === 'function'){
            m.associations(db);
        }
    }
}
function ormEntitys(files, db, cb){
    var i = 0;
    files.forEach(function(item) {
        var tmpPath = path.join(_path, item);
        fs.exists(tmpPath, function(exists){
            if(exists) {
                console.log('ORM -- ' + item);
                require(entityPath + '/' + item)(orm, db);
            }
            i++;
            if(i >= files.length){
                initAssociations(db);
                db.sync(function(err){
                    cb(err, db);
                    console.log('数据库ORM初始化完成.');
                });
            }
        });
    });
}
module.exports = function (cb) {
    if (connection) return cb(null, connection);
    orm.connect(opts, function(err, db) {
        if(err){
            console.log(err);
            cb(err);
            return;
        }
        db.use(transaction);
        connection = db;
        db.settings.set('instance.returnAllErrors', true);
        console.log(_path);
        fs.readdir(_path, function(err, files) {
            if (err) {
                console.log('read dir error');
            } else {
                ormEntitys(files, db, cb);
            }
        });
    });
};