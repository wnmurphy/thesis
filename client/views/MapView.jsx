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
        initMap(location, context, function() {
          context.setState({buttonClass: "circle"});
          context.setState({filterClass: ""});
          context.getSpots();
        });
      }, context);
      }, welcomeScreenTimeout);
    } else {
        context.setState({showScreen: false})
        initMap(globalState.location, context, function() {
          context.setState({buttonClass: "circle"});
          context.setState({filterClass: "input"});
          context.getSpots();
        });
    }
  },

  getSpots: function () {

    var context = this;

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
    var start_am_pm = 'AM';
    var end_am_pm = 'AM'
    for(var i = 0; i < this.state.spots.length; i++) {

      var spot = this.state.spots[i];
      var start, end, startMinutes, endMinutes;


      if(spot.lastId) {
        continue;
      }

      if(spot.start) {
        start = Number(spot.start.split(":")[0]);
        startMinutes = spot.start.split(":")[1];

        if(start > 12) {
          start -= 12;
          start_am_pm = 'PM';
        }
        if(start === 0) {
          start = 12;
          start_am_pm = 'AM';
        }
        if(start > 12) {
          if(start === 12) {
            start_am_pm = 'PM';
          }
          else {
            start -= 12;
            start_am_pm = 'PM';
          }
        }

      }

      if(spot.end) {
        end = Number(spot.end.split(":")[0]);
        endMinutes = spot.end.split(":")[1];
        if(end < 12) {
          end_am_pm = 'AM';
        }
        if(end === 12) {
          end_am_pm = 'PM';
        }
        if(end === 0) {
          end = 12;
          end_am_pm = 'AM';
        }
        if(end > 12) {
          if(end === 12) {
            end_am_pm = 'PM';
          }
          else {
            end -= 12;
            end_am_pm = 'PM';
          }
        }

      }

      var contentString = '<div><strong>' + spot.name + '</strong></div>' +
                          '<div>' + spot.creator + '</div>' +
                          '<div><small>' + spot.category + '</small></div>' +
                          '<div><small>Start: ' + start + ':' + startMinutes + ' ' + start_am_pm + '</small></div>' +
                          '<div><small>End: ' + end + ':' + endMinutes + ' ' + end_am_pm + '</small></div>' +
                          '<div><a href="#/spot/' + spot.spotId +'">More Details</a></div>';

      var icon = {
        url: '/pin.png'
      }

      var spot = new google.maps.Marker({
        icon: icon,
        position: new google.maps.LatLng(spot.location.latitude, spot.location.longitude),
        map: context.state.map,
        id: spot.spotId,
        info: contentString,
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
        maxWidth: 150,
        content: contentString
      })

      var array = this.state.markers;
      array.push(spot);

      this.setState({markers: array});

      google.maps.event.addListener(spot, 'click', function () {
        infoWindow.setContent(this.info);
        infoWindow.open(context.state.map, this);
        context.setState({selected: this.getId()});
        context.state.map.panTo(this.getPosition());
        //console.log(context.state.selected);
      })
    }
  },

  center: function() {
    this.state.map.panTo(this.state.position);
  },

  collapseClick: function () {
    console.log('collapse button clicked!')
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
            <i className="fa fa-caret-square-o-right"></i>
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
    console.log('markers', this.props.markers);
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
