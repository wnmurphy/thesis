/** @jsx React.DOM */

var SpotView = React.createClass({
  getInitialState: function() {
    var hash = window.location.hash.substr(1);
    return {
      spotHash: hash,
      shareProps: {
        contents: 'Check out this Spot! http://localhost:8080/#' + hash,
        subject: 'Check out Spotter',
        url: 'http://localhost:8080/#' + hash
      },
      spot: {},
      shareClass: "share-card-container",
      buttonIcon: "fa fa-share-alt",
      sharing: false

    };
  },

  componentDidMount: function() {
    this.getSpot();
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

  toggleShare: function () {
    var sharing = !this.state.sharing;
    var newState = {sharing: sharing};
    if (sharing) {
      newState.buttonIcon = "fa fa-times",
      newState.shareClass = "share-card-container show-share-card"
    } else {
      newState.buttonIcon = "fa fa-share-alt",
      newState.shareClass = "share-card-container"
    }

    this.setState(newState);
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
          <p>address: {this.state.spot.address}</p>
        </div>
        <div className={this.state.shareClass} onClick={this.toggleShare}>
          <ShareCard shareProps={this.state.shareProps}/>
        </div>
        <div className="share-button-container">
          <a onClick={this.toggleShare} className="circle">
            <i className={this.state.buttonIcon}></i>
          </a>
        </div>
      </div>
    );
  }

});
