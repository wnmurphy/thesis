/** @jsx React.DOM */

var MapView = React.createClass({
  
  getInitialState: function () {
    return {
          
    };
  },

  componentWillMount: function () {
    $.ajax({
      method: 'GET',
      url: '/api/map',
      dataType: 'json',
      success: function(data) {
        this.setState({spots: data});
        console.log("SUCCESS: ", data);
      },
      error: function(error) {
        console.log("ERROR: ", error);
      }
    })
  },

  render: function() {
    return (
      <div>MapView</div>
    );
  }
});
