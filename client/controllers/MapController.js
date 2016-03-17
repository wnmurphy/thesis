var initMap = function (location, context, callback) {

  var position = new google.maps.LatLng(location.latitude, location.longitude);

  context.setState({position: position});

  var style = [
    {
        "featureType": "landscape",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 65
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "poi",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 51
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 30
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.local",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 40
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "transit",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "administrative.province",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "lightness": -25
            },
            {
                "saturation": -100
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "hue": "#ffff00"
            },
            {
                "lightness": -25
            },
            {
                "saturation": -97
            }
        ]
    }
]

  var map = new google.maps.Map(document.getElementById('map'), {
    mapTypeControl: false,
    streetViewControl: false,
    center: position,
    scrollwheel: true,
    zoom: 14,
    zoomControl: false
  });

  var type = new google.maps.StyledMapType(style, {name: '/'});

  map.mapTypes.set('/', type);

  map.setMapTypeId('/');

  // google.maps.event.addDomListener(map, 'tilesloaded', function(){
  //   if($('#map-controls').length === 0) {
  //     $('div.gmnoprint').last().parent().wrap('<div id="map-controls" />');
  //     map.setOptions({
  //       zoomControl: true
  //     });
  //   }
  // });

  context.setState({map: map});

  var icon = {
    url: '/you.png'
  }

  var marker = new google.maps.Marker({
    icon: icon,
    position: position,
    map: map,
    // animation: google.maps.Animation.BOUNCE,
    getPosition: function() {
      return this.position;
    }
  });

  context.setState({marker: marker});

  callback(map, position, marker);
}