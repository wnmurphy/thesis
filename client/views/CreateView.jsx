/** @jsx React.DOM */

var CreateView = React.createClass({

  componentDidMount: function() {
    var location = globalState.location;

    initMap(location, this, this.searchMap);
  },

  getInitialState: function () {
    var categoryOptions = [];
    for (var category in categories) {
      categoryOptions.push(
        <option id="category" value={category}>
          <i className={categories[category]}></i>
          {category}
        </option>);
    }
    return globalState.createState || {categoryOptions: categoryOptions};
  },

  searchMap: function (map, position, marker) {

    var context = this;

    var input = (document.getElementById('address'));

    var autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow({
      maxWidth: 200
    });

    this.setState({infowindow: infowindow});

    this.setState({marker: marker}, function() {
      google.maps.event.addListener(context.state.marker, 'click', function() {
        infowindow.open(map, this);
        map.panTo(this.getPosition());
      });

      google.maps.event.addListener(autocomplete, 'place_changed', function() {

        infowindow.close();

        var place = autocomplete.getPlace();

        context.setState({location: {latitude: place.geometry.location.lat(), longitude: place.geometry.location.lng() } });

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
        context.state.marker.setPlace(({
          placeId: place.place_id,
          location: place.geometry.location
        }));

        context.state.marker.setVisible(true);

        var parts = place.formatted_address.split(',');
        var street = parts[0];
        var locality = parts[1] + ', ' + parts[2];

        var component = place.address_components[0].long_name + ' ' + place.address_components[1].short_name;
        var placeName = place.name;

        if (component === placeName) {
          place.name = "Spot";
        }

        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + street + '<br>' + locality + '</div>');

        infowindow.open(map, context.state.marker);
      });
    });
  },

  sendSpot: function (event) {
    event.preventDefault();
    console.log('this state', this.state);
    var context = this;
    $.ajax({
      method: 'POST',
      url: '/api/create',
      dataType: 'json',
      data: {
        name: context.state.name,
        creator: context.state.creator,
        category: context.state.category,
        location: context.state.location,
        address: context.state.address,
        description: context.state.description,
        start: context.state.start,
        end: context.state.end
      },
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

        var addressFound = data.results[0].formatted_address;
        context.setState({ address: addressFound, location:{latitude: globalState.location.latitude, longitude:globalState.location.longitude} });

        context.state.marker.setPlace(({
          placeId: data.results[0].place_id,
          location: data.results[0].geometry.location
        }));

        context.state.map.setCenter(data.results[0].geometry.location);
        context.state.map.setZoom(17);

        var parts = data.results[0].formatted_address.split(',');
        var street = parts[0];
        var locality = parts[1] + ', ' + parts[2];

        context.state.infowindow.setContent('<div><strong>' + "My Location" + '</strong><br>' + street + '<br>' + locality + '</div>')
        context.state.infowindow.open(context.state.map, context.state.marker);

      },
      error: function (error) {
        console.log("ERROR: ", error);
      }
    })
  },

  selectChange: function(category) {
    this.setState({category: category});
  },

  handleChange: function (event) {
    var newState = {};
    newState[event.target.id] = event.target.value;
    this.setState(newState);
    console.log(this.state);
  },

  changeAddress: function (event) {
    this.setState({address: event.target.value});
  },

  render: function () {
    globalState.createState = this.state;
    var valueLink = {
      value: this.state.category,
      requestChange: this.selectChange
    };
    console.log(this.state.categoryOptions);
    return (
      <div>
        <div className="create-map-view-container">
          <div id="map"></div>
        </div>
        <div className="reset-button-container">
          <a className="circle gps-found" onClick={this.getAddress}>
            <i className="material-icons">gps_fixed</i>
          </a>
        </div>
        <div>
          <form id="createSpotForm" onChange={this.handleChange} onSubmit={this.sendSpot}>
            <input type="text" id="address" placeholder="Location" onChange={this.changeAddress} value={this.state.address || ''} required />
            <input type="text" id="name" placeholder="Title" defaultValue={this.state.name || ''} required />
            <input type="text" id="creator" placeholder="User" defaultValue={this.state.creator || ''} required />
            <select valueLink={valueLink}>
              <option id="category">Select Category</option>
              {this.state.categoryOptions}
            </select>
            <input type="text" id="description" placeholder="Description" defaultValue={this.state.description || ''} required />
            <span>Start Time</span>
            <input type="time" id="start" placeholder="Start" defaultValue={this.state.start || ''} required />
            <span>End Time</span>
            <input type="time" id="end" placeholder="End" defaultValue={this.state.end || ''} />
            <input type="submit" value="submit" />
          </form>
        </div>
      </div>
    );
  }
});
