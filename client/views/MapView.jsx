/** @jsx React.DOM */

var MapView = React.createClass({
  
  getInitialState: function () {
    return {
      spots: []
    };
  },

  componentWillMount: function () {
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
      <div>{spots}</div>
      </div>

    );
  }
});
