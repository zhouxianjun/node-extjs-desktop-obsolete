/**
 * Created with JetBrains WebStorm.
 * User: Gary
 * Date: 14-8-21
 * Time: 上午10:42
 * To change this template use File | Settings | File Templates.
 */
/**
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

var http = require('http');
var crypto = require('crypto');
var fs = require('fs');
//var gm = require('gm').subClass({ imageMagick : true });
var images = require("images");
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};
String.prototype.replaceAll = function(reallyDo, replaceWith, ignoreCase) {
    if (!RegExp.prototype.isPrototypeOf(reallyDo)) {
        return this.replace(new RegExp(reallyDo, (ignoreCase ? "gi": "g")), replaceWith);
    } else {
        return this.replace(reallyDo, replaceWith);
    }
}
module.exports = {
    getIpInfo: function (ip, cb) {
        if (!ip) {
            return cb(false);
        }
        http.get("http://ip.taobao.com/service/getIpInfo.php?ip=" + ip, function (res) {
            if (res.statusCode == 200) {
                var str = '';
                res.on('data', function (data) {
                    str += data;
                });
                res.on('end', function () {
                    try {
                        cb(JSON.parse(str).data);
                    } catch (e) {
                        cb(false);
                    }
                });
            } else {
                cb(false);
            }
        }).on('error', function (e) {
            console.error("Got error: " + e.message);
            cb(false);
        });
    },
    md5: function (str) {
        var md5 = crypto.createHash('md5');
        md5.update(str);
        return md5.digest('hex');
    },
    getFiles: function (root, suffix) {
        var filenames = fs.readdirSync(root) || [];
        if (suffix) {
            var arr = [];
            for (var i = 0; i < filenames.length; i++) {
                if (filenames[i].substr(filenames[i].length - suffix.length)) {
                    arr.push(filenames[i]);
                }
            }
            return arr;
        }
        return filenames;
    },
    resizeImg: function (path, save, size) {
        images(path).size(size).save(save);
    }
};