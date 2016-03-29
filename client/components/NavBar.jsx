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
  render: function() {
    return (
      <div>
         <a href="#/"><i className="material-icons">track_changes</i></a>
         <a href="#/search"><i className="material-icons">search</i></a>
         <a href="#/feed"><i className="material-icons">list</i></a>
         <a href="#/profile"><i className="material-icons">person</i></a>
      </div>
    );
  }
});
