// This controller retrieves feed information from server.
var FeedController = {
  getSpots: function (success, fail) {
    $.ajax({
      method: 'GET',
      url: '/api/feed/' + localStorage.getItem('userId'),
      dataType: 'json',
      success: function (data) {
        success(data);
      },
      error: function (error) {
        fail(error.responseText);
      }
    });
  }
};
