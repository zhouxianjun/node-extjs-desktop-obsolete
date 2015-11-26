var crypt = require('crypto');
var fs = require('fs');
module.exports = {
    sha1: function(path, cb){
        var shasum = crypt.createHash('sha1');

        var s = fs.ReadStream(path);
        s.on('data', function(d) {
            shasum.update(d);
        });

        s.on('end', function() {
            var d = shasum.digest('hex');
            if(typeof cb === 'function'){
                cb(d, path);
            }
        });
    },
    sha1Sync: function(path){
        var shasum = crypt.createHash('sha1');
        var s = fs.readFileSync(path);
        shasum.update(s);
        var d = shasum.digest('hex');
        return d;
    }
};
