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

  var icon = {
    url: '/gps.svg',
    scaledSize: new google.maps.Size(30, 30),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(0, 0)
  }

  var marker = new google.maps.Marker({
    icon: icon,
    position: position,
    map: map,
    title: 'My Location'
  });

  //marker.setIcon('http://maps.google.com/mapfiles/arrow.png');

  callback(map, position);
}