/** @jsx React.DOM */

var LoginRequired = React.createClass({
  getInitialState: function () {
    if (AuthController.signedIn) {
      return {cardContainerClass: 'createView-card-container hide'};
    } else {
      return {cardContainerClass: 'createView-card-container'};
    }
  },

  handleLogin: function () {
    console.log("handling login");
    this.setState({cardContainerClass: 'createView-card-container hide'});
  },

  render: function () {
    return (
      <div className={this.state.cardContainerClass}>
        <LoginCard parent={this} />
      </div>
    );
  }
});

var LoginCard = React.createClass({
  getInitialState: function () {
    return {response: ''};
  },

  handleChange: function (e) {
    var newState = {};
    console.log("handleChange:", this.state);
    newState[e.target.name] = e.target.value;
    this.setState(newState);
  },

  handleSubmit: function (e) {
    e.preventDefault();
    var context = this;
    console.log("handleSubmit:", this.state);
    // AuthController.js
    AuthController.sendLogin(this.state, function() {
      console.log("Handling login in LoginCard");
      console.log('context: ', context);
      context.props.parent.handleLogin();
    }, function(message) {
      context.setState({response: message});
    });
  },

  render: function() {
    console.log("Rendering LoginView");
    return (
      <div className='login-card'>
        <form onSubmit={this.handleSubmit} onChange={this.handleChange}>
          <input name="username" type="text" placeholder="Username" required />
          <input name="password" type="password" placeholder="Password" required />
          <input type="submit" value="Log In"/>
        </form>
        <Toast message={this.state.response} />
      </div>
    );
  }
});
