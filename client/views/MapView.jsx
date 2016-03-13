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
    }, function(error){
      console.log(error);
    });
  },
  initMap: function() {
    var marker;
    var position = {lat: this.state.location.latitude, lng: this.state.location.longitude};
    console.log('this state in init map', this.state);
    var map = new google.maps.Map(document.getElementById('map'), {
      center: position,
      scrollwheel: true,
      zoom: 13
    });

    var myMarker = new google.maps.Marker({
      position: position,
      map: map,
      title: 'Hello World!'
    });

   
    console.log(this.state.spots);
    // var x = document.getElementById('map');
    // google.maps.event.addDomListener(x, 'click', function() {
    //   window.alert('Map was clicked!');
    // });

    for(var i = 0; i < this.state.spots.length - 1; i++) {

      var spot = this.state.spots[i];
      var contentString = '<div>Name: ' + spot.name + '</div>' +
                          '<div>Host: ' + spot.creator + '</div>' +
                          '<div>Description: ' + spot.description + '</div>';
          
          marker = new google.maps.Marker({
          position: {lat: spot.location.latitude, lng:spot.location.longitude},
          map: map,
          title: 'Hello World!',
          name: spot.name,
          description: spot.description,
          info: contentString
        });

      
      var infoWindow = new google.maps.InfoWindow({
        content: contentString
      })
      
      google.maps.event.addListener(marker, 'click', function() {
        console.log('clicked');
        console.log(this);
        infoWindow.setContent(this.info);
        infoWindow.open(map, this);
      })
    }  
      
    

    

    
  },
  render: function() {
    return (
      <div>
        <div id="map"></div>  
      </div>

    );
  }
});
