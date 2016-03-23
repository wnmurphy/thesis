/** @jsx React.DOM */

// Load react.js from index.html for browser environment, or npm for test environment.
var React = React || require('react');

// Define the minimum time (ms) to show welcome-view-container on first run.
var welcomeScreenTimeout = 1000;

var MapView = React.createClass({

  // Create a lookup for CSS classes.
  getDefaultProps: function () {
    return {
      collapseButtonContainer: "collapse-button-container",
      filterSearchClass: "filter-search",
      refreshButtonContainer: "refresh-button-container",
      centerButtonContainer: "center-button-container"
    }
  },

  getInitialState: function () {
    return {
      spots: globalState.spots,
      selected: {},
      location: globalState.location,
      refreshingClass: "",
      buttonClass: "hide",
      filterClass: "hide",
      showButtonClass: "",
      markers: []
    };
  },

  //
  componentDidMount: function() {

    var context = this;

    // Listen for spots created by other users and refresh map.
    // socket.on('spotAdded', this.getSpots);


    // Check whether location has been set globally.
    // If not, get location and initialize map with nearby spots.
    // Otherwise, just initialize the map.
    if(!globalState.location) {
      context.setState({showScreen: true})
      setTimeout(function() {
        getLocation(function(location) {
        initMap(location, context, function(map) {
          map.setOptions({zoomControl: true});
          context.setState({buttonClass: "circle"});
          context.setState({filterClass: ""});
          context.setState({location: location});
          context.setState({center: location});
          context.getSpots(true);
        });
      }, context);
      }, welcomeScreenTimeout);
    } else {
        context.setState({showScreen: false})
        initMap(globalState.location, context, function(map) {
          map.setOptions({zoomControl: true});
          context.setState({buttonClass: "circle"});
          context.setState({filterClass: ""});
          console.log('globalState location', globalState.location);
          context.setState({center: globalState.location}, function() {
            context.getSpots();
          });
        });
    }
  },

  // Make AJAX call to server to retrieve spot data near center of map.
  // Server calculates distance and returns only spots within 50 miles.
  getSpots: function (animate) {

    var context = this;

    // Hide all previous markers.
    this.state.markers.forEach(function(marker) {
      marker.setVisible(false);
    })

    this.setState({markers: []});

    this.setState({refreshingClass: " spin"});
    $.ajax({
      method: 'GET',
      url: '/api/map',
      dataType: 'json',
      data: {"location": context.state.center},
      success: function (data) {
        globalState.spots = data;
        context.setState({spots: data});
        context.setState({refreshingClass: ""});
        context.initSpots(animate);

      },
      error: function (error) {
        console.log("ERROR: ", error);
        context.setState({refreshingClass: ""});
      }
    })
  },

  // Loop through spot data from server.
  // Generate a map marker and summary bubble for each spot.
  initSpots: function (animate) {
    var context = this;

    for(var i = 0; i < this.state.spots.length; i++) {

      var spot = this.state.spots[i];

      if(spot.lastId) {
        continue;
      }

      // Comparator for current time with start or end time;
      // Parses time to a formatted string for display in spot summary bubble.

      var start = spot.start.split(':').join('');
      if (spot.end) {
        var end = spot.end.split(':').join('');
      }
      var current = getTime();
      var time, prefix, suffix, hours, minutes;

      var stringify = function(time) {

        hours = Number(time.substring(0, 2)) - Number(current.substr(0, 2));

        hours = hours * 60;

        minutes = Number(time.substring(2)) - Number(current.substr(2));

        var total = hours + minutes;

        minutes = total % 60;

        hours = (total - minutes) / 60;

        if (hours === 0) {
          hours = null;
        } else if (hours === 1) {
          hours = hours + " hour ";
        } else {
          hours = hours + " hours ";
        }

        if (minutes === 0) {
          minutes = null;
        } else if (minutes === 1) {
          minutes = minutes + " minute"
        } else {
          minutes = minutes + " minutes"
        }
      }

      if (start > current) {
        stringify(start);
        if (hours === null) {
          prefix = "";
        } else {
          prefix = "in " + hours;
        }
        if (minutes === null) {
          suffix = "";
        } else {
          if (hours === null) {
            suffix = "in " + minutes;
          } else {
            suffix = " and " + minutes;
          }
        }
      } else {
        if (end) {
          stringify(end);
          if (hours === null) {
            prefix = "";
          } else {
            prefix = hours;
          }
          if (minutes === null) {
            suffix = "";
          } else {
            if (hours === null) {
              suffix = minutes + " left";
            } else {
              suffix = " and " + minutes + " left";
            }
          }
        } else {
          prefix = "happening now";
          suffix = "";
        }
      }

      time = prefix + suffix;

      //Temporarily skips marking expired spots until we get server handling and cleanup
      if(time.indexOf('-') > -1 ) {
        continue;
      }

      var contentString = '<div style="font-size: 12px"><strong>' + spot.name + '</strong></div>' +
                          '<img style="float: right; padding-top: 15px" src="/img/map/silhouette.png">' +
                          '<div style="font-size: 11px; float: right; clear: right; padding-right: .5px"><small>' + spot.creator + '</small></div>' +
                          '<div style="font-size: 11px; padding-top: 2px">' + spot.category + '</div>' +
                          '<div><small><small>' + time + '</small></small></div>';

      contentString += '<div><small><small><a href="#/spot/' + spot.spotId +'">More Details</a></small></small></div>';

      var icon = {
        url: '/img/map/pin_test.png'
      }

      var animation;

      if (animate) {
        animation = google.maps.Animation.DROP;
      } else {
        animation = null;
      }

      // Create a new map marker for each spot.
      var spot = new google.maps.Marker({
        icon: icon,
        position: new google.maps.LatLng(spot.location.latitude, spot.location.longitude),
        map: context.state.map,
        id: spot.spotId,
        info: contentString,
        animation: animation,
        fields: spot.name + " " + spot.description + " " + spot.category,
        getId: function() {
          return this.id;
        },
        getPosition: function() {
          return this.position;
        },
        getFields: function() {
          return this.fields;
        }
      });

      // Define summary bubble for each spot.
      var infoWindow = new google.maps.InfoWindow({
        maxWidth: 250,
        content: contentString
      })

      var array = this.state.markers;
      array.push(spot);

      this.setState({markers: array});

      // When user clicks on spot, open summary bubble, load that spot's data, and center the map on the marker.
      google.maps.event.addListener(spot, 'click', function () {
        infoWindow.setContent(this.info);
        infoWindow.open(context.state.map, this);
        context.setState({selected: this.getId()});
        context.state.map.offsetPan(this.getPosition(), 0, -55);
      })
    }
  },

  // Center the map on the user's current GPS location.
  center: function() {
    this.state.map.offsetPan(this.state.position, 0, -50);
  },

  // Toggle visibility of button drawer via CSS class.
  collapseClick: function () {
    var newState = {};
    if (this.state.showButtonClass === "") {
      newState.showButtonClass = "-show";
    } else {
      newState.showButtonClass = "";
    }
    this.setState(newState);
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
        <div className={this.props.collapseButtonContainer + " " + this.props.collapseButtonContainer + this.state.showButtonClass} onClick={this.collapseClick}>
          <a className={this.state.buttonClass}>
            <i className="fa fa-ellipsis-h"></i>
          </a>
        </div>
        <div className={this.props.refreshButtonContainer + " " + this.props.refreshButtonContainer + this.state.showButtonClass + this.state.refreshingClass}>
          <a onClick={this.getSpots} className={this.state.buttonClass}>
            <i className="material-icons">refresh</i>
          </a>
        </div>
        <div className={this.props.centerButtonContainer + " " + this.props.centerButtonContainer + this.state.showButtonClass}>
          <a onClick={this.center} className={this.state.buttonClass}>
            <i className="material-icons">gps_fixed</i>
          </a>
        </div>
        <div className={this.props.filterSearchClass + " " + this.props.filterSearchClass + this.state.showButtonClass}>
          <FilterSearch filterClass={this.state.filterClass} markers={this.state.markers} />
        </div>
      </div>
    );
  }
});

// Display welcome message on first run.
var LoadScreen = React.createClass({
  render: function() {
    return (
      <div className="welcome-container">
        <div>
          <h1>irl</h1>
          <h2>welcome!</h2>
          <p>your map is loading...</p>
        </div>
      </div>
    )
  }
})

// Toggle visibility of on-screen map markers depending on user text input.
var FilterSearch = React.createClass({
  getInitialState: function () {
    return {
      filter: ''
    }
  },
  handleChange: function (event) {
    var search = new RegExp(event.target.value, 'gi');
    this.props.markers.forEach(function(marker) {
      var fields = marker.getFields();
      if(fields.match(search)) {
        marker.setVisible(true);
      } else {
        marker.setVisible(false);
      }
    });

  },
  render: function () {
    return (
      <div style={{width: 'calc(100vw / 2)', opacity: '0.75'}}>
        <form className={this.props.filterClass} style={{padding: '0px'}} onChange={this.handleChange}>
          <input type="text" id="filter-search" placeholder="Filter Spots" defaultValue={this.state.filter || ''} />
        </form>
      </div>
    )
  }
});
