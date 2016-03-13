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
