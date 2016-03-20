/** @jsx React.DOM */

var Chat = React.createClass({
  render: function () {
    return (
      <div className="chat-card">

        <div className="chat-container">

          <ul className="chat">
          </ul>

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