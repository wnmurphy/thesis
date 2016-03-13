/** @jsx React.DOM */

var MapView = React.createClass({
  
  getInitialState: function () {
    return {
      spots: []
    };
  },

  componentWillMount: function () {
    this.getLocation();
    var context = this;
    $.ajax({
      method: 'GET',
      url: '/api/map',
      dataType: 'json',
      success: function(data) {
        context.setState({spots: data});
        console.log("SUCCESS: ", context.state.spots);
      },
      error: function(error) {
        console.log("ERROR: ", error);
      }
    })
  },
  componentDidUpdate: function () {
    this.initMap();
    this.render();
  },
  getLocation: function () {
    var currentLocation = {};
    var context = this;
    // The following call is asynchronous and takes a few seconds...
    // This should also probably be eventually moved to MapView, as
    // location will be needed there first to render the map.
    navigator.geolocation.getCurrentPosition(function(position){
      currentLocation.latitude = position.coords.latitude;
      currentLocation.longitude = position.coords.longitude;
      context.setState({location: currentLocation});
      console.log('context state', context.state.location);
    }, function(error){
      console.log(error);
    });
  },
  initMap: function() {
    // var mapProp = {
    //   center:new google.maps.LatLng(51.508742,-0.120850),
    //   zoom:5,
    //   mapTypeId:google.maps.MapTypeId.ROADMAP
    // };
    // var map=new google.maps.Map(document.getElementById("googleMap"), mapProp);
    var context = this;
    console.log('this state in init map', this.state);
    var map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: context.state.location.latitude, lng: context.state.location.longitude},
      scrollwheel: false,
      zoom: 8
    });
  },
  render: function() {
    var spots = this.state.spots.map(function(spot) {
      return (
        <div>
        <p>Name: {spot.name}</p>
        <p>Creator: {spot.creator}</p>
        <p>Description: {spot.description}</p>
        </div>
      )
    }, this)
    return (
      <div>Map View
        <div id="map"></div>  
        <div>{spots}</div>
      </div>

    );
  }
});
