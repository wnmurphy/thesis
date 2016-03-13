// Default values for contents (body) and subject of messages.
var messageDefaults = {
  contents: 'Check out Spots! www.spots.com',
  subject: 'Check out Spots'
}


// Fully functional on iOS and Android in built in browser.
// Not tested in 3rd-party browsers yet.
// Doesn't load anything if not on iOS or Android.
var ShareSMS = React.createClass({
  getDefaultProps: function () {
    return {contents: messageDefaults.contents}
  },

  getInitialState: function () {
    var state = {
      iOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
      android: /(android)/i.test(navigator.userAgent)
    }

    if (state.iOS) {
      state.formatted = 'sms:&body=';
    } else {
      state.formatted = 'sms:;body=';
    }
    return state;
  },

  render: function () {
    if (this.state.android || this.state.iOS) {
      return (
        <a href={this.state.formatted.concat(this.props.contents)} className="sms">
          <i className="material-icons">message</i>
        </a>
      );
    } else {
      return null;
    }
  }
});

// Fully functional.
var ShareEmail = React.createClass({
  getDefaultProps: function () {
    return {
      contents: messageDefaults.contents,
      subject: messageDefaults.subject
    }
  },

  render: function () {
    return (
      <a href={"mailto:?subject=" + this.props.subject + "&body=" + this.props.contents} className="email">
        <i className="material-icons">email</i>
      </a>
    );
  }
});

// Currently just a link to Google+
var ShareGoogle = React.createClass({
  render: function () {
    return (
      <a href='https://plus.google.com/' target="_blank" className="googleplus">
        <i className="fa fa-google-plus"></i>
      </a>
    );
  }
});

// Currently just a link to facebook
var ShareFacebook = React.createClass({
  render: function () {
    return (
      <a href='https://www.facebook.com/' target="_blank" className="facebook">
        <i className="fa fa-facebook"></i>
      </a>
    );
  }
});

// Currently just a link to Twitter
var ShareTwitter = React.createClass({
  render: function () {
    return (
      <a href='https://twitter.com/' target="_blank" className="twitter">
        <i className="fa fa-twitter"></i>
      </a>
    );
  }
});

var ShareCard = React.createClass({
  getDefaultProps: function () {
    return {
      contents: messageDefaults.contents,
      subject: messageDefaults.subject
    }
  },

  render: function () {
    return (
      <div className='share-card'>
        <ShareSMS contents={this.props.contents} />
        <ShareEmail contents={this.props.contents} subject={this.props.subject}/>
        <ShareGoogle contents={this.props.contents} />
        <ShareFacebook contents={this.props.contents} />
        <ShareTwitter contents={this.props.contents} />
      </div>
    );
  }
});
