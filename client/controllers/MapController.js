var initMap = function (location, context, callback) {

  var position = new google.maps.LatLng(location.latitude, location.longitude);

  var style = [
    {
      "featureType": "administrative.neighborhood",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "landscape.man_made",
      "elementType": "geometry.fill",
      "stylers": [
          {
            "visibility": "off"
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
      "featureType": "poi.business",
      "elementType": "all",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi.business",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi.government",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi.medical",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#ded3c7"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#d2e5c7"
        }
      ]
    },
    {
      "featureType": "poi.place_of_worship",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi.school",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#e6dfd8"
        }
      ]
    },
    {
      "featureType": "poi.sports_complex",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#cbbcac"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "saturation": "16"
        },
        {
          "lightness": "25"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "lightness": "100"
        },
        {
        "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels.icon",
      "stylers": [
        {
          "saturation": "0"
        },
        {
          "lightness": "29"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "visibility": "on"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "visibility": "off"
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
      "featureType": "road.local",
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "transit.station.airport",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "hue": "#9d00ff"
        },
        {
          "saturation": "25"
        },
        {
          "lightness": "5"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#9fdbf4"
        },
        {
          "lightness": "5"
        }
      ]
    }
  ]

  var map = new google.maps.Map(document.getElementById('map'), {
    mapTypeControl: false,
    streetViewControl: false,
    center: position,
    scrollwheel: true,
    zoom: 14
  });

  var type = new google.maps.StyledMapType(style, {name: '/'});

  map.mapTypes.set('/', type);

  map.setMapTypeId('/');

  context.setState({map: map});

  var icon = {
    url: '/home.png'
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

  callback(map, position, marker);
}