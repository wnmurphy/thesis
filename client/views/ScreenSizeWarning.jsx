var ScreenSizeWarning = React.createClass({
  getInitialState: function () {
    return {
      width: $(window).width(),
      dismissed: localStorage.getItem('screenWarning'),
      dismissedClass: ''
    }
  },

  dismiss: function () {
    this.setState({dismissedClass: ' dismissed'});
    localStorage.setItem('screenWarning', true);
  },

  render: function () {
    if (this.state.width <= 600 || this.state.dismissed) {
      return null;
    } else {
      return (
        <div className={"screen-warning" + this.state.dismissedClass}>
          <div className=''>
            <h1>Hey friend!</h1>
            <h2>We love irl and we think you will too!</h2>
            <h2>But you'll probably love it even more on your phone...</h2>
            <div className='warning-buttons'>
              <a href="mailto:?subject=irl&body=" className='button'>send me a link</a>
              <div className='button' onClick={this.dismiss}>i just want in</div>
            </div>
          </div>
        </div>
      );
    }
  }
});
