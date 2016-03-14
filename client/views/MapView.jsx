/** @jsx React.DOM */

// This will be used as the min time (ms) to show
// welcome-view-container

var MapView = React.createClass({

  getInitialState: function () {
    return {
      spots: globalState.spots,
      selected: {},
      location: globalState.location,
      refreshButton: "refresh-button-container",
      buttonClass: "hide"
    };
  },

  componentWillMount: function() {
    var context = this;
    if(!globalState.location) {
      context.setState({showScreen: true})
      setTimeout(function() {
        context.getLocation(function(location) {
        context.initMap(location);
      });
      }, 2000);
    } else {
      context.getLocation(function(location) {
        context.setState({showScreen: false})
        context.initMap(location);
      });
    }
  },

  getSpots: function () {
    var context = this;

    this.setState({refreshButton: "refresh-button-container spin"});

    $.ajax({
      method: 'GET',
      url: '/api/map',
      dataType: 'json',
      success: function (data) {
        globalState.spots = data;
        context.setState({spots: data});
        console.log("SUCCESS: ", context.state.spots);
        context.setState({refreshButton: "refresh-button-container"});
        context.initSpots();
      },
      error: function (error) {
        console.log("ERROR: ", error);
        context.setState({refreshButton: "refresh-button-container"});
      }
    })
  },

  getLocation: function (callback) {
    var currentLocation = {};
    var context = this;
    navigator.geolocation.getCurrentPosition(function(position){
      currentLocation.latitude = position.coords.latitude;
      currentLocation.longitude = position.coords.longitude;
      callback(currentLocation);
      globalState.location = currentLocation;
      context.setState({location: currentLocation});
    }, function(error){
      console.log(error);
    });
  },

  initMap: function (location) {
    var context = this;

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

    this.setState({map: map});

    var myMarker = new google.maps.Marker({
      position: position,
      map: map,
      title: 'My Location'
    });

    myMarker.setIcon('http://maps.google.com/mapfiles/arrow.png');

    this.setState({buttonClass: "circle"});
    this.getSpots();
  },

  initSpots: function () {
    // need to make this wait to run until map loads
    var context = this;

    for(var i = 0; i < this.state.spots.length; i++) {

      var spot = this.state.spots[i];
      if(spot.lastId) {
        continue;
      }

      var contentString = '<div>Name: ' + spot.name + '</div>' +
                          '<div>Host: ' + spot.creator + '</div>' +
                          '<div>Description: ' + spot.description + '</div>';

      var spot = new google.maps.Marker({
        position: new google.maps.LatLng(spot.location.latitude, spot.location.longitude),
        map: context.state.map,
        id: spot.spotId,
        info: contentString,
        getId: function() {
          return this.id;
        },
        getPosition: function() {
          return this.position;
        }
      });

      var infoWindow = new google.maps.InfoWindow({
        content: contentString
      })

      google.maps.event.addListener(spot, 'click', function () {
        infoWindow.setContent(this.info);
        infoWindow.open(context.state.map, this);
        context.setState({selected: this.getId()});
        context.state.map.panTo(this.getPosition());
        console.log(context.state.selected);
      })
    }
  },

  render: function () {
    return (
      <div className="map-view-container">
        <div id="map">
          {this.state.showScreen ? <LoadScreen /> : null}
        </div>
        <div className="create-button-container">
          <a href="#/create" className={this.state.buttonClass}>
            <i className="material-icons">add</i>
          </a>
        </div>
        <div className={this.state.refreshButton}>
          <a onClick={this.getSpots} className={this.state.buttonClass}>
            <i className="material-icons">refresh</i>
          </a>
        </div>
      </div>
    );
  }
});

var LoadScreen = React.createClass({
  render: function() {
    return (
      <div className="welcome-container">
      <div>
        <h1>Welcome to Happn!</h1>
        <h2>Find the Haps!</h2>
        <p>(your HapMap is loading now)</p>
      </div>
      </div>
    )
  }
})
