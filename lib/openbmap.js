var request = require('request'),
    parser = require('xml2json');

function lookup(mcc, mnc, lac, cid, callback) {
  // curl -i --data "mcc=310&mnc=260&lac=40497&cid=19943081" http://www.openbmap.org/api/getGPSfromGSM.php
  //
  var form = {mcc: mcc, mnc: mnc, cid: cid, lac: lac};
  var url = "http://www.openbmap.org/api/getGPSfromGSM.php";
  request.post({ url:url, form: form }, function(e, r, body) {
    if (e) { return callback(e) }
    var data = JSON.parse(parser.toJson(body));
    var coords = null;
    if (data.gsm && data.gsm.zone) {
      var result = data.gsm.zone;
      // Ignore results that aren't accurate
      // OpenBMap will happily give back the entire US as a geo polygon
      if (result.maxradius < 100) {
        coords = {
          lat: result.lat,
          lng: result.lng,
          source: 'openbmap',
          accuracy: result.maxradius
        }
      }
    }
    return callback(null, coords);
  });
}

exports.setup = function() {
  return {
    lookup: lookup
  }
}

