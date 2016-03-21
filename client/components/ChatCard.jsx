/** @jsx React.DOM */

var Chat = React.createClass({
  render: function () {

    var messages = this.props.messages.map(function(message) {
      return (
        <div>
          <span>{message.username} - </span><span>{message.text}</span>
        </div>
      )
    }, this);

    return (
      <div className="chat-card">

        <div className="chat-container">

          <div className="chat">
          {messages}
          </div>

        </div>

        <div className="chat-form-container">

          <form className="chat-form" >

            <input type="text" placeholder="speak yo mind, russell"/>

            <input type="submit" value="send" />
          </form>

        </div>
      </div>
    );  
  }
});