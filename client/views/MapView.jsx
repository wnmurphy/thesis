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
        <p>{spot.name}</p>
      )
    }, this)
    return (
      <div>Map View
      <div>{spots}</div>
      </div>

    );
  }
});
