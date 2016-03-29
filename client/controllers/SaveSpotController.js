// Handles saving spots to your feed.
var SaveSpotController = {
  saveSpot: function(spotId, success, fail) {
    $.ajax({
      method: 'POST',
      url: '/api/saveSpot/',
      data: {
        "userId": localStorage.getItem('userId'),
        "spotId": spotId
      },
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
