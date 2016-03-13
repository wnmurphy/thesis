/** @jsx React.DOM */

// This will be used as the min time (ms) to show
// welcome-view-container
var welcomeScreenTimout = 2000;

var MapView = React.createClass({

  getInitialState: function () {
    return {
      spots: [],
      selected: {}
    };
    this.getLocation();
  },

  componentWillMount: function () {
    this.getLocation();

    var context = this;

    var checkForCurrentLocation = function () {
      if (context.state.location) {
        context.initMap();
      } else {
        setTimeout(checkForCurrentLocation, 100);
      }
    }

    // Added this time out to always show welcome-div
    setTimeout(checkForCurrentLocation, welcomeScreenTimout);

    $.ajax({
      method: 'GET',
      url: '/api/map',
      dataType: 'json',
      success: function(data) {
        context.setState({spots: data});
        console.log("SUCCESS: ", context.state.spots);
        setTimeout (function () {
          context.initSpots();
        }, 5000);
      },
      error: function(error) {
        console.log("ERROR: ", error);
      }
    })
  },

  getLocation: function () {
    var currentLocation = {};
    var context = this;
    navigator.geolocation.getCurrentPosition(function(position){
      currentLocation.latitude = position.coords.latitude;
      currentLocation.longitude = position.coords.longitude;
      console.log(currentLocation);
      context.setState({location: currentLocation});
    }, function(error){
      console.log(error);
    });
  },

  initMap: function () {
    var context = this;

    var position = {lat: this.state.location.latitude, lng: this.state.location.longitude};

    console.log('initMap position:', position);
    var map = new google.maps.Map(document.getElementById('map'), {
      mapTypeControl: false,
      streetViewControl: false,
      center: position,
      scrollwheel: true,
      zoom: 13
    });

    this.setState({map: map});

    var myMarker = new google.maps.Marker({
      position: position,
      map: map,
      title: 'My Location'
    });

    myMarker.setIcon('http://maps.google.com/mapfiles/arrow.png');

  },

  initSpots: function () {
    var context = this;

    console.log("initializing spot markers");

    for(var i = 0; i < this.state.spots.length - 1; i++) {

      var spot = this.state.spots[i];


      var contentString = '<div>Name: ' + spot.name + '</div>' +
                          '<div>Host: ' + spot.creator + '</div>' +
                          '<div>Description: ' + spot.description + '</div>';

      var spot = new google.maps.Marker({
        position: {lat: spot.location.latitude, lng:spot.location.longitude},
        map: context.state.map,
        id: spot.spotId,
        info: contentString
      });

      var infoWindow = new google.maps.InfoWindow({
        content: contentString
      })

      google.maps.event.addListener(spot, 'click', function () {
        infoWindow.setContent(this.info);
        infoWindow.open(context.state.map, this);
        context.setState({selected: this.id});
        console.log(context.state.selected);
      })
    }
  },

  render: function () {
    return (
      <div className="map-view-container">
        <div id="map">
          <div className="welcome-container">
            <div>
              <h1>Welcome to Happn!</h1>
              <h2>Find the Haps!</h2>
              <p>(your HapMap is loading now)</p>
            </div>
          </div>
        </div>
        <div className="create-button-container">
          <a href="#/create" className="circle">
            <i className="material-icons">add</i>
          </a>
        </div>
      </div>
    );
  }
});
