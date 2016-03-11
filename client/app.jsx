/** @jsx React.DOM */

var AppView = React.createClass({
  render: function() {
    console.log("Rendering");
    return (
      <div>Hello New World</div>
    );
  }
});

ReactDOM.render(<AppView/>, document.getElementById('app-container'));
