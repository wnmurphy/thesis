var NavBar = React.createClass({
  render: function() {
    return (
      <div>
        NavBar
        <div>
          <Link to="/map">Map</Link>
          <Link to="/search">Search</Link>
          <Link to="/feed">Feed</Link>
          <Link to="/profile">Profile</Link>
        </div>
      </div>
    );
  }
});