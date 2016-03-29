var ScreenSizeWarning = React.createClass({
  getInitialState: function () {
    return {
      width: $(window).width(),
      dismissed: localStorage.getItem('screenWarning')
    }

  },

  render: function () {

  }
});
