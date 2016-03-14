/** @jsx React.DOM */

var CreateView = React.createClass({

  componentDidMount: function() {
    this.initMap();
  },

  getInitialState: function () {
    return globalState.createState || {};
  },

  initMap: function () {

    var context = this;

    var position = new google.maps.LatLng({lat: globalState.location.latitude, lng: globalState.location.longitude});

    var options = {
      center: position,
      mapTypeControl: false,
      streetViewControl: false,
      scrollwheel: true,
      zoom: 13
    };

    var map = new google.maps.Map(document.getElementById('create-map'), options);

    var input = (document.getElementById('address'));
    
    var autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow({
      maxWidth: 200
    });

    var marker = new google.maps.Marker({
      map: map,
      position: position,
      getPosition: function() {
        return this.position;
      }
    });

    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map, marker);
      map.panTo(this.getPosition());
    });

    // this.setState({autocomplete: autocomplete});
    // Get the full place details when the user selects a place from the
    // list of suggestions.
    google.maps.event.addListener(autocomplete, 'place_changed', function() {

      infowindow.close();
      
      var place = autocomplete.getPlace();

      context.setState({location: {latitude: place.geometry.location.lat(), longitude: place.geometry.location.lng() } });

      console.log('place', place);

      context.setState({address: place.formatted_address });

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
      marker.setPlace(({
        placeId: place.place_id,
        location: place.geometry.location
      }));

      marker.setVisible(true);
      
      var parts = place.formatted_address.split(',');
      var street = parts[0];
      var locality = parts[1] + ', ' + parts[2];

      var component = place.address_components[0].long_name + ' ' + place.address_components[1].short_name;
      var placeName = place.name;

      if (component === placeName) {
        place.name = "Spot";
      }

      infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + street + '<br>' + locality + '</div>');

      infowindow.open(map, marker);
    });
  },

  sendSpot: function (event) {
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

  getAddress: function (event) {
    event.preventDefault();

    var context = this;

    var address = 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' +
                    globalState.location.latitude + ',' + globalState.location.longitude + '&sensor=true';

    $.ajax({
      method: 'GET',
      url: address,
      dataType: 'json',
      success: function (data) {
        console.log('ADDRESS: ', data);
        var addressFound = data.results[0].formatted_address;
        context.setState({ address: addressFound, location:{latitude: globalState.location.latitude, longitude:globalState.location.longitude} });
        google.maps.event.trigger(context.state.autocomplete, 'place_changed');
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
  },

  changeAddress: function (event) {
    this.setState({address: event.target.value});
  },

  render: function () {
    globalState.createState = this.state;
    console.log('this state', this.state);
    console.log('global state', globalState);
    return (
      <div>
        <div className="create-map-view-container">
          <div id="create-map"></div>
        </div>
        <div className="reset-button-container">
          <a className="circle gps-found" onClick={this.getAddress}>
            <i className="material-icons">gps_fixed</i>
          </a>
        </div>
        <div>
          <form id="createSpotForm" onChange={this.handleChange} onSubmit={this.sendSpot}>
            <input type="text" id="address" placeholder="Location" onChange={this.changeAddress} value={this.state.address || ''} />
            <input type="text" id="name" placeholder="Title" defaultValue={this.state.name || ''} />
            <input type="text" id="creator" placeholder="User" defaultValue={this.state.creator || ''} />
            <input type="text" id="category" placeholder="Category" defaultValue={this.state.category || ''} />
            <input type="text" id="description" placeholder="Description" defaultValue={this.state.description || ''} />
            <input type="text" id="start" placeholder="Start Time" defaultValue={this.state.start || ''} />
            <input type="text" id="end" placeholder="End Time" defaultValue={this.state.end || ''} />
            <input type="submit" value="submit" />
          </form>
        </div>
        
      </div>
    );
  }
});