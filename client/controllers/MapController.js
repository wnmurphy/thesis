var initMap = function (location, context, callback) {

  var position = new google.maps.LatLng(location.latitude, location.longitude);

  var style = [{
      featureType: "road",
      elementType: "all",
      stylers: [{visibility: "on"}]
  }];

  var map = new google.maps.Map(document.getElementById('map'), {
    mapTypeControl: false,
    streetViewControl: false,
    center: position,
    scrollwheel: true,
    zoom: 13
  });

  var type = new google.maps.StyledMapType(style, {name: '/'});

  map.mapTypes.set('/', type);

  map.setMapTypeId('/');

  context.setState({map: map});

  var myMarker = new google.maps.Marker({
    position: position,
    map: map,
    title: 'My Location'
  });

  myMarker.setIcon('http://maps.google.com/mapfiles/arrow.png');

  callback(map, position);
}