/** @jsx React.DOM */

// This will be used as the min time (ms) to show
// welcome-view-container
var React = React || require('react');
var welcomeScreenTimeout = 1000;

var MapView = React.createClass({

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

  componentDidMount: function() {

    var context = this;

    // Listen for spots created by other users and refresh map.
    // socket.on('spotAdded', this.getSpots);

    if(!globalState.location) {
      context.setState({showScreen: true})
      setTimeout(function() {
        getLocation(function(location) {
        initMap(location, context, function(map) {
          map.setOptions({zoomControl: true});
          context.setState({buttonClass: "circle"});
          context.setState({filterClass: ""});
          context.getSpots();
        });
      }, context);
      }, welcomeScreenTimeout);
    } else {
        context.setState({showScreen: false})
        initMap(globalState.location, context, function(map) {
          map.setOptions({zoomControl: true});
          context.setState({buttonClass: "circle"});
          context.setState({filterClass: ""});
          context.getSpots();
        });
    }
  },

  getSpots: function () {

    var context = this;
    this.state.markers.forEach(function(marker) {
      marker.setVisible(false);
    })

    this.setState({markers: []});

    this.setState({refreshingClass: " spin"});

    $.ajax({
      method: 'GET',
      url: '/api/map',
      dataType: 'json',
      success: function (data) {
        globalState.spots = data;
        context.setState({spots: data});
        //console.log("SUCCESS: ", context.state.spots);
        context.setState({refreshingClass: ""});
        context.initSpots();

      },
      error: function (error) {
        console.log("ERROR: ", error);
        context.setState({refreshingClass: ""});
      }
    })
  },

  initSpots: function () {
    // need to make this wait to run until map loads
    var context = this;

    for(var i = 0; i < this.state.spots.length; i++) {

      var spot = this.state.spots[i];

      if(spot.lastId) {
        continue;
      }

      /* Comparator for current time with start or end time;
         parsing into a formatted string for info window display */

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
                          '<img style="float: right; padding-top: 15px" src="/silhouette.png">' +
                          '<div style="font-size: 11px; float: right; clear: right; padding-right: .5px"><small>' + spot.creator + '</small></div>' +
                          '<div style="font-size: 11px; padding-top: 2px">' + spot.category + '</div>' +
                          '<div><small><small>' + time + '</small></small></div>';

      contentString += '<div><small><small><a href="#/spot/' + spot.spotId +'">More Details</a></small></small></div>';

      var icon = {
        url: '/pin_test.png'
      }

      var spot = new google.maps.Marker({
        icon: icon,
        position: new google.maps.LatLng(spot.location.latitude, spot.location.longitude),
        map: context.state.map,
        id: spot.spotId,
        info: contentString,
        animation: google.maps.Animation.DROP,
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

      var infoWindow = new google.maps.InfoWindow({
        maxWidth: 250,
        content: contentString
      })

      var array = this.state.markers;
      array.push(spot);

      this.setState({markers: array});

      google.maps.event.addListener(spot, 'click', function () {
        infoWindow.setContent(this.info);
        infoWindow.open(context.state.map, this);
        context.setState({selected: this.getId()});
        context.state.map.offsetPan(this.getPosition(), 0, -55);
      })
    }
  },

  center: function() {
    this.state.map.offsetPan(this.state.position, 0, -50);
  },

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
