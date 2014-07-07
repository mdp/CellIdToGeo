#!/usr/bin/env node

var fs = require('fs');
var async = require('async');
var program = require('commander');
var index = require('./index');

program.version('0.0.1')
  .option('-o, --out [file]', 'Output file')
  .parse(process.argv);

function getLines(input, cb) {
  var remaining = '';
  var lines = [];

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    var last  = 0;
    while (index > -1) {
      var line = remaining.substring(last, index);
      last = index + 1;
      lines.push(line);
      index = remaining.indexOf('\n', last);
    }

    remaining = remaining.substring(last);
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      lines.push(remaining);
      return cb(lines);
    }
    cb(lines);
  });
}

function asyncFind(source, arr, done) {
  var fn = function(a, callback){
    var result = {
      created_at: a.created_at
    }
    if (a.error) {
      result.error = a.error;
      return callback(null, result);
    }
    index.find(source,
               a["MCCMNC"].substr(0,3), a["MCCMNC"].substr(3,5), a.Lac, a.Cid,
               function(err, data){
                 if (data) {
                   result.geocoding = {
                     source: source,
                     lat: data.lat,
                     lng: data.lng,
                     accuracy: data.accuracy
                   }
                 }
                 result.mccmnc = a["MCCMNC"];
                 result.lac = a["Lac"];
                 result.cid = a["Cid"];
                 callback(err, result);
               });
  };
  async.mapSeries(arr, fn, done);
}

var input = fs.createReadStream(program.args[0]);
getLines(input, function(lines) {
  var coords = []
  for(var i=0; i < lines.length; i++){
    coords.push(JSON.parse(lines[i]));
  }
  index.setup(function(){
    var source = 'openbmap';
    if (process.env['GOOGLE_API_KEY']) {
      source = 'google'
    }
    asyncFind(source, coords, function(err, results){
      if (program.out) {
        fs.writeFileSync(program.out, JSON.stringify(results, null, 4));
      }
      console.log(results);
    });
  });
});

