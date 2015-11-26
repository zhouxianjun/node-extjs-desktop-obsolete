/**
 * Created by Gary on 2014/9/9.
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
module.exports = function (orm, db) {
    db.define('ExtjsRole', {
        id: {type: 'serial', key: true},
        descr: String,
        name: String,
        enable: {type: 'boolean', defaultValue: true}
    }, {
        methods: {
            raw: function(){
                return this.__opts.data
            }
        }
    }).associations = function(db){
        this.hasMany('modulars', db.models.ExtjsModular, {}, {
            reverse: 'roles'
        });
        this.hasMany('functions', db.models.ExtjsFunction, {});
    };
};