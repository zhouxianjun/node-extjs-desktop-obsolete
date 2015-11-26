/**
 * Created with JetBrains WebStorm.
 * User: Gary
 * Date: 14-8-19
 * Time: 下午5:28
 * To change this template use File | Settings | File Templates.
 */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path');
var fs = require('fs');
var url = require('url');
var routing = require('./src/Routing.js');
var obj = require('./src/util/Object');
var result = require('./src/util/Result');
var errorCode = require('./src/util/ErrorCodeDesc').errorCode;
var DBManager = require('./src/dao/DBManager.js');
var configuration = require('./src/Configuration');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var session = require('express-session'); //如果要使用session，需要单独包含这个模块
var cookieParser = require('cookie-parser'); //如果要使用cookie，需要显式包含这个模块
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});
var loginFilter = ['/admin/login', '/admin/logout', '/gzip/load', '/'];

DBManager(function (err, db) {
    if (err) {
        console.error('数据库初始化异常!' + err);
    }else{
        configuration(db.models);
    }
});

var io = require('socket.io')(http);

console.log('in configure');
app.use(methodOverride());
app.use(bodyParser());
app.use(cookieParser('extjs_'));
app.use(session({secret: 'extjs_'}));
app.use(function (req, res, next) {
    var path = url.parse(req.url).pathname;
    if(path.indexOf('.') != -1){
        next();
    }else{
        var have = false;
        obj.each(loginFilter, function(i, v){
            if(path == v){
                have = true;
            };
        });
        if(have){
            next();
        }else{
            if(req.session && req.session.EXTJS_DESKTOP_ROLE && req.session.EXTJS_DESKTOP_ADMIN){
                next();
            }else{
                var resp = new result(errorCode.NO_ACCESS, '请登录后操作!');
                res.json(resp);
            }
        }
    }
});
app.use(function (req, res, next) {
    DBManager(function (err, db) {
        if (err) return next(err);
        req.models = db.models;
        req.db     = db;
        return next();
    });
});
//重定向静态文件 html,css,js,jpg,png => /static/+req.url
app.all('/',function(req, res, next){
    var realpath = __dirname + '/WebRoot/index.html';
    res.end(fs.readFileSync(path.normalize(realpath)));
    res.end();
});
app.all('/*.(gzjs|html|css|js|jpg|png|gif){1}', function(req, res, next){
    var realpath = __dirname + '/WebRoot' + url.parse(req.url).pathname;
    var ext = path.extname(req.url);
    if(ext == '.gzjs' || req.url.indexOf('.gzip.css') > 0){
        res.setHeader("Content-Encoding", "gzip");
        res.setHeader("Accept-Encoding", "gzip");
    }
    fs.exists(realpath,function(exists){
        if(exists)
            res.end(fs.readFileSync(path.normalize(realpath)));
        else
            res.end('Cannot find request url: '+req.url);
    });
});
app.set('context path', __dirname + '/WebRoot');
app.set('port', 8888);
// routing settings
routing(app);
http.listen(8888, function(){
    console.log('listening on *:8888');
});