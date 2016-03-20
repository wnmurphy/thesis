/** @jsx React.DOM */

var ProfileView = React.createClass({
  getDefaultProps: function () {
    return {
      requireAuth: !!window.location.hash.substring(10)
    };
  },

  getInitialState: function () {
    return {
      userId: window.location.hash.substring(10)
    };
  },

  componentDidMount: function () {
    var context = this;
    console.log("mount trigger", globalState.userId, this.state.userId);
    ProfileController.getProfile(context.state.userId, function (profile) {
      context.setState(profile)
    }, function (message) {console.log(message)});
  },

  post: function () {
    console.log("signIn triggered");
    this.setState({userId: globalState.userId}, function () {
      console.log("callback triggered");
      this.componentDidMount();
    });
  },

  render: function() {
    console.log("Rendering ProfileView");
    if (this.props.requireAuth) {
      var login = null;
    } else {
      var login = <LoginRequired parent={this} />;
    }
    return (
      <div className="profile-view">
        <img src={this.state.img} />
        <h1>{this.state.username}</h1>
        <h3>{this.state.bio}</h3>
        {login}
      </div>
    );
  }
});
