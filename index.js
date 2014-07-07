var openbmap = require('./lib/openbmap').setup();
var google_geo = require('./lib/google_geo').setup(process.env["GOOGLE_API_KEY"]);

var Datastore = require('nedb')
  , db = new Datastore({ filename: 'database.json' });

function find(source, mcc, mcn, lac, cid, callback) {
  var key = getKey(source, mcc, mcn, lac, cid);
  db.findOne({key: key}, function(err, doc) {
    if (doc) {
      return callback(null, doc);
    }
    var newDoc = null;
    lookupRateLimited(source, mcc, mcn, lac, cid, function(err, data){
      if (data) {
        newDoc = data;
        newDoc.key = key;
        db.insert(newDoc, function(err, doc){
          callback(null, newDoc);
        });
      } else {
        // Unable to lookup cellid
        callback(null, null);
      }
    });
  });
}

function getKey(source, mcc, mcn, lac, cid, callback) {
  return source + "_" + mcc + "_" + mcn + "_" + lac + "_" + cid;
}

function lookup(source, mcc, mcn, lac, cid, callback) {
  if (source == 'google') {
    google_geo.lookup(mcc, mcn, lac, cid, function(err, data) {
      callback(err, data);
    })
  } else {
    openbmap.lookup(mcc, mcn, lac, cid, function(err, data) {
      callback(err, data);
    })
  }
}

function lookupRateLimited() {
  var args = arguments;
  var ms = 1000;
  if (this.lastUse && (this.lastUse + ms) > Date.now()) {
    console.log("RateLimit pause")
    setTimeout(function(){
      lookup.apply(this, args);
    },ms-(Date.now() - this.lastUse));
  } else {
    this.lastUse = Date.now();
    lookup.apply(this, args);
  }
}

exports.setup = function(ready){
  db.loadDatabase(function (err) {
    if (err) {console.log(err); return ready(err);}
    return ready(null);
  });
}

exports.lookup = lookupRateLimited;
exports.find = find;
