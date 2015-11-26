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
var fs = require('fs');
var path = require('path');
var result = require('../util/Result');
var helper = require('../services/helper');
var services = require('../services');
var util = require('../util/Util');
var fileSHA1 = require('../util/fileSHA1');
var page = require('../dto/Page');
var errorCode = require('../util/ErrorCodeDesc').errorCode;
var UglifyJS = require("uglify-js");
var zlib = require('zlib');
var cacheShaPath = process.cwd() + '/gzip.sha';
function checkSha(sha, str, orgFileSha) {
    for(var i = 0; i < sha.length; i++){
        if (sha[i].file == str && sha[i].sha == orgFileSha) {
            return true;
        }
    }
    return false;
}
function put(sha, str, orgFileSha){
    var have = null;
    for(var i = 0; i < sha.length; i++){
        if (sha[i].file == str) {
            have = sha[i];
        }
    }
    if(have != null){
        have.sha = orgFileSha;
    }else{
        sha.push({
            file: str,
            sha: orgFileSha
        });
    }
}
module.exports = {
    load: function(req, res, next){
        var type = req.param("type");
        var contextPath = req.app.get('context path');
        var files = req.param("files").split(",");
        var basePath = req.protocol + '://' + req.hostname + ':' + req.app.get('port');
        var source = '';
        for(var i = 0; i < files.length; i++){
            var str = files[i];
            if(str && str.trim()){
                var orgFilePath = path.normalize(contextPath + '/' + str);
                var start = new Date().getTime();
                if(type && type == 'source'){
                    //压缩
                    source += UglifyJS.minify(orgFilePath).code;
                }else{
                    var name = str.substr(0, str.lastIndexOf('.') + 1) + 'gz' + str.substr(str.lastIndexOf('.') + 1);
                    var gzPath = path.normalize(contextPath + '/' + name);
                    var sha = null;
                    if(fs.existsSync(cacheShaPath)){
                        sha = fs.readFileSync(cacheShaPath);
                    }
                    sha = sha == null ? [] : JSON.parse(sha);
                    var orgFileSha = fileSHA1.sha1Sync(orgFilePath);
                    if(!fs.existsSync(gzPath) || !checkSha(sha, str, orgFileSha)){
                        var min = str.substr(0, str.lastIndexOf('.') + 1) + 'min' + str.substr(str.lastIndexOf('.'));
                        var minpath = path.normalize(contextPath + '/' + min);
                        fs.writeFileSync(minpath, UglifyJS.minify(orgFilePath).code, 'utf8');
                        var inp = fs.createReadStream(minpath);
                        var out = fs.createWriteStream(gzPath);
                        inp.pipe(zlib.createGzip()).pipe(out);
                        fs.unlink(minpath);
                        put(sha, str, orgFileSha);
                        fs.writeFileSync(cacheShaPath, JSON.stringify(sha));
                    }
                    source += basePath + '/' + name + ',';
                }
                var end = new Date().getTime();
                var runtime = (end - start) / 1000;
                console.log('压缩文件: ' + orgFilePath + ' 耗时: ' + runtime);
            }
        };
        if(type != 'source' && source.length > 0){
            source = source.substr(0, source.length - 1);
        }
        res.end(source);
    }
};