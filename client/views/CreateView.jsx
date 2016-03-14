/** @jsx React.DOM */

var CreateView = React.createClass({

  componentWillMount: function () {
  },

  componentDidMount: function() {
    this.mapInitialize();
  },

  getInitialState: function () {
    return globalState.createState || {};
  },

  mapInitialize: function () {
    var context = this;
    var myPosition = new google.maps.LatLng({lat: globalState.location.latitude, lng: globalState.location.longitude});
    var mapOptions = {
      center: myPosition,
      mapTypeControl: false,
      streetViewControl: false,
      scrollwheel: true,
      zoom: 13
    };
    var map = new google.maps.Map(document.getElementById('createmap'),
      mapOptions);

    var input = (document.getElementById('pac-input'));

    
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    

    var infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
      map: map,
      position: myPosition
      // getPosition: function() {
      //   return this.position;
      // }
    });
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map, marker);
      // map.panTo(this.getPosition());
    });

    // Get the full place details when the user selects a place from the
    // list of suggestions.
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
      infowindow.close();
      
      var place = autocomplete.getPlace();
      context.setState({location: {latitude: place.geometry.location.lat(), longitude: place.geometry.location.lng() } });
      console.log('place', place);
      console.log('place lat', place.geometry.location.lat());
      console.log('place long', place.geometry.location.lng());

      if (!place.geometry) {
        return;
      }

      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      }

      // Set the position of the marker using the place ID and location.
      marker.setPlace(/** @type {!google.maps.Place} */ ({
        placeId: place.place_id,
        location: place.geometry.location
      }));
      marker.setVisible(true);

      infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
          'Place ID: ' + place.place_id + '<br>' +
          place.formatted_address + '</div>');
      infowindow.open(map, marker);
    });
  },

  sendSpot: function (event) {
    console.log('location', this.state.location);
    event.preventDefault();
    $.ajax({
      method: 'POST',
      url: '/api/create',
      dataType: 'json',
      data: this.state,
      success: function (data) {
        globalState.createState = {};
        console.log("SUCCESS");
        window.location = '/';
      },
      error: function (error) {
        console.log(error);
      }
    })
  },

  getAddress: function(event) {
    event.preventDefault();
    var context = this;
    var address = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' +
                    globalState.location.latitude + ',' + globalState.location.longitude + '&sensor=true';

    $.ajax({
      method: 'GET',
      url: address,
      dataType: 'json',
      success: function (data) {
        console.log('address data', data);
        var addressFound = data.results[0].formatted_address;
        context.setState({address: addressFound, location:{latitude: globalState.location.latitude, longitude:globalState.location.longitude }});
      },
      error: function (error) {
        console.log("ERROR: ", error);
      }
    })
  },

  handleChange: function (event) {
    var newState = {};
    newState[event.target.id] = event.target.value;
    this.setState(newState);
    console.log(this.state);
  },
  // changeAddress: function (event) {
  //   this.setState({address: event.target.value});
  // },

  render: function () {
    globalState.createState = this.state;
    console.log("Rendering CreateView", globalState.createState);
    return (
      <div>
        <div className="map-view-container">
          <div id="createmap"></div>
        </div>
        <div className="create-button-container">
          <a className="circle gps-found" onClick={this.getAddress}>
            <i className="material-icons">gps_fixed</i>
          </a>
        </div>
        <div>
          <form id="createSpotForm" onChange={this.handleChange} onSubmit={this.sendSpot}>
            <input type="text" id="pac-input" placeholder="Location" defaultValue={this.state.address || ''} />
            <input type="text" id="name" placeholder="spot title" defaultValue={this.state.name || ''} />
            <input type="text" id="creator" placeholder="created by..." defaultValue={this.state.creator || ''} />
            <input type="text" id="category" placeholder="category" defaultValue={this.state.category || ''} />
            <input type="text" id="description" placeholder="spot description" defaultValue={this.state.description || ''} />
            <input type="text" id="start" placeholder="startTime" defaultValue={this.state.start || ''} />
            <input type="text" id="end" placeholder="endTime" defaultValue={this.state.end || ''} />
            <input type="submit" value="submit" />
          </form>
        </div>
        
      </div>
    );
  }
});