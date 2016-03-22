// Create a Google Map element.
// Takes current user location, component as context to render within, and callback.
var initMap = function (location, context, callback) {

  var position = new google.maps.LatLng(location.latitude, location.longitude);

  context.setState({position: position});

  // Array containing style configuration for Google Maps.
  var style = [
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#6195a0"
            }
        ]
    },
    {
        "featureType": "administrative.province",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
            {
                "lightness": "0"
            },
            {
                "saturation": "0"
            },
            {
                "color": "#f5f5f2"
            },
            {
                "gamma": "1"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "all",
        "stylers": [
            {
                "lightness": "-3"
            },
            {
                "gamma": "1.00"
            }
        ]
    },
    {
        "featureType": "landscape.natural.terrain",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#bae5ce"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#fac9a9"
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text",
        "stylers": [
            {
                "color": "#4e4e4e"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#787878"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "transit.station.airport",
        "elementType": "labels.icon",
        "stylers": [
            {
                "hue": "#0a00ff"
            },
            {
                "saturation": "-77"
            },
            {
                "gamma": "0.57"
            },
            {
                "lightness": "0"
            }
        ]
    },
    {
        "featureType": "transit.station.rail",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#43321e"
            }
        ]
    },
    {
        "featureType": "transit.station.rail",
        "elementType": "labels.icon",
        "stylers": [
            {
                "hue": "#ff6c00"
            },
            {
                "lightness": "4"
            },
            {
                "gamma": "0.75"
            },
            {
                "saturation": "-68"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#eaf6f8"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#c7eced"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "lightness": "-49"
            },
            {
                "saturation": "-53"
            },
            {
                "gamma": "0.79"
            }
        ]
    }
]

  // Create a new map and append to #map element.
  var map = new google.maps.Map(document.getElementById('map'), {
    mapTypeControl: false,
    streetViewControl: false,
    center: position,
    scrollwheel: true,
    zoom: 14,
    zoomControl: false
  });

  // Create a new style object for map, using the config array above.
  var type = new google.maps.StyledMapType(style, {name: '/'});

  map.mapTypes.set('/', type);

  map.setMapTypeId('/');

  // Extend Map prototype with ability to offset the map center.
  // Useful for styling map around other elements.
  google.maps.Map.prototype.offsetPan = function(position, x, y) {
    var map = this;
    var overlay = new google.maps.OverlayView();
    overlay.onAdd = function() {
      var projection = this.getProjection();
      var point = projection.fromLatLngToContainerPixel(position);
      point.x = point.x + x;
      point.y = point.y + y;
      map.panTo(projection.fromContainerPixelToLatLng(point));
    }; 
    overlay.draw = function() {}; 
    overlay.setMap(this); 
  };

  // Listen for the end of a drag and update the map center.
  google.maps.event.addListener(map, 'dragend', function(event) {
    var center = {
      latitude: this.center.lat(),
      longitude: this.center.lng()
    }
    context.setState({center: center});
    context.getSpots();
  })
  context.setState({map: map});

  var icon = {
    url: '/you_test.png'
  }

  // Define marker for user location. 
  // (i.e., 'You are here.')
  var marker = new google.maps.Marker({
    icon: icon,
    position: position,
    map: map,
    getPosition: function() {
      return this.position;
    }
  });

  context.setState({marker: marker});

  callback(map, position, marker);
}