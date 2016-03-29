// Renders bottom nav menu.
var NavButton = React.createClass({
  getInitialState: function () {
    var linkClass = '';
    return {};
  },

  render: function () {
    return (
      <a href={this.props.href} className={this.state.linkClass}>
        <i className="material-icons">{this.props.icon}</i>
      </a>
    );
  }
});

var NavBar = React.createClass({
  getInitialState: function() {
    return {
      feedUpdate: false       
    };
  },

  componentDidMount: function () {
    var context = this;
    socket.on('updateFeed', function (follower) {
      context.setState({feedUpdate: true, icon: "fa fa-bell feed-update"}); 
    });

    // socket.on('newMessage', function(message) {
    //   console.log('new message', message);
    //   if(message.username !== localStorage.getItem('username')) {
    //     context.setState({feedUpdate: true, 
    //                       icon: "fa fa-comment-o fa-2x feed-update",
    //                       uri: '#/spot/' + message.spotId
    //                     })
    //   }
      
    // });  

    
    // <i className="fa fa-bell feed-update"></i>
  },

  updateFeed: function() {
    this.setState({feedUpdate:false});
  },

  render: function() {
    return (
      <div>
         <a href="#/"><i className="material-icons">track_changes</i></a>
         <a href="#/search"><i className="material-icons">search</i></a>
         <a href="#/feed" onClick={this.updateFeed}>
          {!this.state.feedUpdate ? <i className="material-icons">list</i> : <i className="material-icons feed-icon">list</i>}
          {this.state.feedUpdate ? <i className={this.state.icon}></i> : null}
         </a>
         <a href="#/profile"><i className="material-icons">person</i></a>
      </div>
    );
  }
});
