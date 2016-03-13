var NavButton = React.createClass({
  getInitialState: function () {
    var linkClass = '';
    
    // sets initial state for active
    // turned off until it can handle switching location

    // if (window.location.hash === this.props.href) {
    //   return {linkClass: 'active'};
    // }
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
          <NavButton href="#/" icon="track_changes" />
          <NavButton href="#/search" icon="search" />
          <NavButton href="#/feed" icon="list" />
          <NavButton href="#/profile" icon="person" />
        </div>
    );
  }
});
