var request = require('request')

exports.setup = function(api_key) {
  function lookup(mcc, mnc, lac, cid, callback) {
    var json = {
      "homeMobileCountryCode": mcc,
      "homeMobileNetworkCode": mnc,
      "radioType": "gsm",
      "cellTowers": [{
        "cellId": cid,
        "locationAreaCode": lac,
        "mobileCountryCode": mcc,
        "mobileNetworkCode": mnc
      }],
      "wifiAccessPoints": []
    };
    var url = "https://www.googleapis.com/geolocation/v1/geolocate?key=" + api_key;
    request.post({ url:url, json: json }, function(e, r, body) {
      if (e) {
        console.log("Error:" + e);
        return callback(e)
      }
      var result = body.location;
      if (!result) {
        console.log("Unable to find: ", json);
        return callback(null, null);
      }
      result.source = 'google';
      result.accuracy = body.accuracy;
      return callback(null, result);
    });
  }
  return {
    lookup: lookup
  }
}

