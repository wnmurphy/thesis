var ShareSMS = React.createClass({
  
});

var ShareCard = React.createClass({
  render: function () {
    return (
      <div className='share-card'>
        <a href='' className="sms">
          <i className="material-icons">message</i>
        </a>
        <a href='' className="email">
          <i className="material-icons">email</i>
        </a>
        <a href='' className="googleplus">
          <i className="fa fa-google-plus"></i>
        </a>
        <a href='' className="facebook">
          <i className="fa fa-facebook"></i>
        </a>
        <a href='' className="twitter">
          <i className="fa fa-twitter"></i>
        </a>
      </div>
    );
  }
});
