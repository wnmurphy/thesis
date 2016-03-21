/** @jsx React.DOM */

var ProfileView = React.createClass({
  getDefaultProps: function () {
    return {
      requireAuth: !window.location.hash.substring(10)
    };
  },

  getInitialState: function () {
    return {
      userId: window.location.hash.substring(10),
      shareClass: "share-card-container",
      buttonIcon: "fa fa-share-alt",
      sharing: false
    };
  },

  componentDidMount: function () {
    var context = this;
    console.log("mount trigger", globalState.userId, this.state.userId);
    ProfileController.getProfile(context.state.userId, function (profile) {
      context.setState(profile);
      context.setState({shareProps: {
                          contents: 'Check out ' + profile.username + ' on this irl! www.irl.com/#/profile/' + profile.userId,
                          subject: 'Check out ' + profile.username,
                          url: 'www.irl.com/#/profile/' + context.state.userId
                        }});
    }, function (message) {console.log(message)});
  },

  post: function () {
    console.log("signIn triggered");
    this.setState({userId: globalState.userId}, function () {
      console.log("callback triggered");
      this.componentDidMount();
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
    console.log("Rendering ProfileView");
    if (this.props.requireAuth) {
      var login = <LoginRequired parent={this} />;
    } else {
      var login = null;
    }

    if (globalState.userId === this.state.userId) {
      var button = null;
    } else {
      var button =  <div>
                      <div className={this.state.shareClass} onClick={this.toggleShare}>
                        <ShareCard shareProps={this.state.shareProps}/>
                      </div>
                      <div className="share-button-container">
                        <a onClick={this.toggleShare} className="circle">
                          <i className={this.state.buttonIcon}></i>
                        </a>
                      </div>
                    </div>
    }
    return (
      <div className="profile-view">
        <div className="profile-header">
          <img className="profile-picture" src={this.state.img} />
          <div className="profile-name">
            <h1>{this.state.username}</h1>
          </div>
        </div>
        <h3 className="profile-bio">{this.state.bio}</h3>
        <table className="profile-stats">
          <tr>
            <td className="stat">{this.state.spots}</td>
            <td className="divider" />
            <td className="stat">{this.state.followers}</td>
          </tr>
          <tr>
            <td className="label">Spots<br />Created</td>
            <td className="divider" />
            <td className="label">Followers</td>
          </tr>
        </table>
        {login}
        {button}
      </div>
    );
  }
});
