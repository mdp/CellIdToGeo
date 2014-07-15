var map;
function addMap(logs){
  var mapOptions = {
    zoom: 13,
    center: new google.maps.LatLng(37.759, -122.45)
  };
  map = new google.maps.Map(document.getElementById('map'),
                            mapOptions);
  var points = [];
  var pointsMap = {};
  var lastLng, lastLat;
  logs.filter(function(l){return l.geocoding}).forEach(function (entry) {
    var key = entry.geocoding.lat + "," + entry.geocoding.lng;
    var lat = entry.geocoding.lat;
    var lng = entry.geocoding.lng;
    // Avoid needless coords
    if (pointsMap[key]) {
      pointsMap[key].infowindow.content += "<span>"+ new Date(Date.parse(entry.created_at)).toString() + "</span><br />"
      return false;
    }
    var point = new google.maps.LatLng(lastLat = lat, lastLng = lng);
    var infowindow = new google.maps.InfoWindow({
      content: "<span>"+ new Date(Date.parse(entry.created_at)).toString() + "</span><br />"
    });
    points.push(point)
    pointsMap[key] = {
      point: point,
      infowindow: infowindow
    }
    var marker = new google.maps.Marker({
      position: point,
      map: map,
      title: entry.created_at
    });
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
    });
  });
  var cellPath = new google.maps.Polyline({
    path: points,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });

  cellPath.setMap(map);
  console.log(points);
}
$(document).ready(function(){
  var file = window.location.hash.slice(1);
  if (file.length < 1) {file = "out.json"}
  $.getJSON(file, addMap)
});
