/** @jsx React.DOM */

var SpotView = React.createClass({
  getInitialState: function() {
    var hash = window.location.hash.substr(1);
    return {
      spotHash: hash,
      spot: {}
    };
  },

  componentDidMount: function() {
    this.getSpot();
    initMap(globalState.location, this);
  },

  getSpot: function() {
    var context = this;

    this.setState({loading: true});

    $.ajax({
      method: 'GET',
      //refactor to get correct spotId
      url: '/api' + context.state.spotHash,
      dataType: 'json',
      success: function (data) {
        console.log("data: ", data);
        context.setState({spot: data});
        console.log("SUCCESS: ", context.state.spot);
        context.setState({loading: false});
        initMap(data.location, context);
      },
      error: function (error) {
        console.log("ERROR: ", error);
        context.setState({loading: false});
      }
    });
  },
  initMap: function() {

  },

  render: function() {
    console.log("Rendering SpotView");
    return (
      <div className="spot-container">
        <div className="create-map-view-container">
          <div id="map"></div>
        </div>
        <div className='spot-view-container'>
          <div className="spot-name-container">
            <div className='category-icon-container'>
              <i className={categories[this.state.spot.category]}></i>
            </div>
            <span className='spot-name'>{this.state.spot.name}</span>
          </div>
          <h3>@{this.state.spot.start}</h3>
          <h4>created by: {this.state.spot.creator}</h4>
          <p>description: {this.state.spot.description}</p>
        </div>
      </div>
    );
  }

});
