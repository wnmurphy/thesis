/** @jsx React.DOM */

var Toast = React.createClass({
  render: function () {
    if(this.props.message) {
      return (
        <div className="toast error">{this.props.message}</div>
      );
    } else {
      return null;
    }
  }
});

var LoginView = React.createClass({
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
    AuthController.sendLogin(this.state, function(message) {
      context.setState({response: message});
    });
  },

  render: function() {
    console.log("Rendering LoginView");
    return (
      <div>
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
