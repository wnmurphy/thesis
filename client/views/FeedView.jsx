/** @jsx React.DOM */

var FeedView = React.createClass({
  getInitialState: function() {
      return {
        savedSpots: [],
        followedUsersSpots: []     
      };
  },
  componentDidMount: function() {
    var context = this;
    FeedController.getSavedSpots(function(data){
      if (data.length) {
        context.setState({savedSpots: data});
      }
    }, function(err) {
      console.log(err);
    });
    FeedController.getFollowedUsersSpots(function(data) {
      if (data.length) {
        context.setState({followedUsersSpots: data});
      }
    }, function(err) {
      console.log(err);
    });
  },

  render: function() {
    console.log("Rendering FeedView");
    console.log("Saved spots: ", this.state.savedSpots);
    console.log("Followed Users' Spots: ", this.state.followedUsersSpots);
    var savedSpots = this.state.savedSpots.map(function (spot) {
      return (
        <div className ='saved-spot'>
          <div className = 'saved-spot-name'>{spot.name}</div>
          <div className = 'saved-spot-creator'>{spot.creator}</div>
          <div className = 'saved-spot-start'>{spot.start}</div>
        </div>
      );
    }, this);
    var followedUsersSpots = this.state.followedUsersSpots.map(function(spot) {
      return (
        <div className = 'followed-user-spot'>
          <div className = 'followed-user-spot-name'>{spot.name}</div>
          <div className = 'followed-user-spot-creator'>{spot.creator}</div>
          <div className = 'followed-user-spot-start'>{spot.start}</div>
        </div>
      );
    });

    return (
      <div>
        <LoginRequired />
        <div >Saved Spots
          <div className='saved-spot-container'>{savedSpots}</div>
        </div>
        <div>Feed
          <div className='followed-user-spot-container'>{followedUsersSpots}</div>
        </div>
      </div>
    );
  }
});

