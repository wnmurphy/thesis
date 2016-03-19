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