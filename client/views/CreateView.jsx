/** @jsx React.DOM */

var CreateView = React.createClass({

  componentWillMount: function () {
    this.getLocation();
  },

  getInitialState: function () {
    return globalState.createState || {};
  },

  getLocation: function () {
    var currentLocation = {};
    var context = this;
    navigator.geolocation.getCurrentPosition(function (position) {
      currentLocation.latitude = position.coords.latitude;
      currentLocation.longitude = position.coords.longitude;
      context.setState({location: currentLocation});
    }, function (error) {
      console.log(error);
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
        console.log("SUCCESS");
      },
      error: function (error) {
        console.log(error);
      }
    })
  },

  handleChange: function (event) {
    var newState = {};
    newState[event.target.id] = event.target.value;
    this.setState(newState);
    console.log(this.state);
  },

  render: function () {
    globalState.createState = this.state;
    console.log("Rendering CreateView", globalState.createState);
    return (
      <form id="createSpotForm" onChange={this.handleChange} onSubmit={this.sendSpot}>
        <input type="text" id="name" placeholder="spot title" defaultValue={this.state.name || ''} />
        <input type="text" id="creator" placeholder="created by..." defaultValue={this.state.creator || ''} />
        <input type="text" id="category" placeholder="category" defaultValue={this.state.category || ''} />
        <input type="text" id="description" placeholder="spot description" defaultValue={this.state.description || ''} />
        <input type="text" id="start" placeholder="startTime" defaultValue={this.state.start || ''} />
        <input type="text" id="end" placeholder="endTime" defaultValue={this.state.end || ''} />
        <input type="submit" value="submit" />
      </form>
    );
  }
});