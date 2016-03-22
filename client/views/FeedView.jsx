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
    return (
      <div>
        <LoginRequired />
        <div className='saved-spot-container'>Saved Spots</div>
        <div className='followed-userSpot-container'>Feed</div>
      </div>
    );
  }
});

// <div className ='saved-spot'>
//   <div className = 'saved-spot-name'>{spot.name}</div>
//   <div className = 'saved-spot-creator'>{spot.creator}</div>
//   <div className = 'saved-spot-start'>{spot.start}</div>
// </div>