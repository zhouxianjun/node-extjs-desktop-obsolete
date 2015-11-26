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
    db.define('ExtjsFunction', {
        id: String,
        text: String,
        leaf: Boolean,
        expanded: Boolean,
        checked: Boolean,
        cls: {type: 'text', defaultValue: 'folder' },
        fid: {type: 'serial', key: true}
    }, {
        hooks: {
            beforeSave: function(next){
                var me = this;
                this.getChildren(function(err, arr){
                    me.leaf = me.parent == null ? (arr == null || arr.length < 1) : !me.parent;
                    me.leaf = !me.id ? false : me.leaf;
                    var tid = -1;
                    try{
                        tid = parseInt(me.id);
                    }catch (e){}
                    if(me.id && tid > 0){
                        me.leaf = tid == fid ? false : leaf;
                    }
                    next();
                });
            }
        },
        methods: {
            raw: function(){
                return this.__opts.data
            }
        }
    }).associations = function(db){
        this.hasMany('children', db.models.ExtjsFunction, {});
    };
};