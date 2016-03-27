/** @jsx React.DOM */

var Chat = React.createClass({
  getInitialState: function () {
    return {
      message: "",
      messages: []
    };
  },
  componentWillReceiveProps: function () {
    this.setState({messages: this.props.messages});
  },
  componentDidMount: function () {
    var context = this;
    socket.on('newMessage', function(message) {
      var updatedMessages = context.state.messages;
      if(message.spotId === context.props.spotId) {
        updatedMessages.push(message);
        context.setState({messages: updatedMessages});
      }
    })
  },
  handleSubmit: function(event) {
    event.preventDefault();

    var timeStamp = new Date();

    var message = {
      spotId: this.props.spotId,
      username: localStorage.getItem('username'),
      userId: globalState.userId,
      text: this.state.message,
      timeStamp: timeStamp
    }
    socket.emit('messageSend', message);
    this.setState({message: ""});
    scrollChat();
  },

  handleChange: function(event) {
    this.setState({message: event.target.value})
    console.log("MESSAGE", this.state.message);
  },

  render: function () {
    var user = localStorage.getItem('username');

    var messages = this.state.messages.map(function(message) {
      if (user === message.username) {
        var bubble = "user-bubble clear";
      } else {
        var bubble = "chat-bubble clear";
      }
      return (
        <div className={bubble}>
          <div className="message-text">{message.text}</div>
          <div className="message-footer">{message.username} @{timeController.timestampToTime(message.timeStamp)}</div>
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

          <form className="chat-form" onSubmit={this.handleSubmit}>

            <input type="text" className="chat-input" defaultValue={this.state.message} placeholder="speak yo mind, russell" name="message" onChange={this.handleChange} autoComplete='off'/>

            <div className="button small right" onClick={this.handleSubmit}>send</div>
          </form>

        </div>
      </div>
    );
  }
});


var scrollChat =  function () {
  console.log($(".chat-container").height());
  $(".chat-container").animate({ scrollTop: $('.chat-container').height() + 100}, 500);
}
