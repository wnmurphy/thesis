/** @jsx React.DOM */

var ProfileView = React.createClass({
  render: function() {
    console.log("Rendering ProfileView");
    return (
      <div>
        ProfileView
        <LoginRequired />
      </div>
    );
  }
});
