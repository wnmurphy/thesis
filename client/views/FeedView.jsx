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
    FeedController.getSpots(function(data){
      console.log('data: ', data);
      if (data.savedSpots.length) {
        context.setState({savedSpots: data.savedSpots});
      }
      if (data.followedUsersSpots.length) {
        context.setState({followedUsersSpots: data.followedUsersSpots});
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
          <div className = 'saved-spot-creator'>Created by {spot.creator}</div>
          <div className = 'saved-spot-start'>Starting at {spot.start}</div>
        </div>
      );
    }, this);
    var followedUsersSpots = this.state.followedUsersSpots.map(function(spot) {
      return (
        <div className = 'followed-user-spot'>
          <div className = 'followed-user-spot-name'>{spot.name}</div>
          <div className = 'followed-user-spot-creator'>Created by {spot.creator}</div>
          <div className = 'followed-user-spot-start'>Starting at {spot.start}</div>
        </div>
      );
    });

    return (
      <div>
        <LoginRequired />
        <h3 >Saved Spots</h3>
        <div className='saved-spot-container'>{savedSpots}</div>
        <h3>Feed</h3>
        <div className='followed-user-spot-container'>{followedUsersSpots}</div>
      </div>
    );
  }
});

