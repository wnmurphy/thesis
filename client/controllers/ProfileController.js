var ProfileController = {
  getProfile: function (id, success, fail) {
    // Should be sending an ajax call to the server.
    if (id) {
      $.ajax({
        method: 'GET',
        url: '/api/profile/' + id,
        dataType: 'json',
        success: function (data) {
          var user = data.result;
          user.signedIn = data.currentUser;
          console.log(user);
          success(user);
        },
        error: function (error) {
          fail(error.responseText);
        }
      });
    } else {
      success({});
    }
  },

  updateProfile: function (profile) {
    $.ajax({
      method: 'PUT',
      url: '/api/profile',
      contentType: 'json',
      data: JSON.stringify(profile),
      success: function (data) {
        console.log(data);
      },
      error: function (error) {
        console.log(error);
      }
    });
  },

  sendImage: function (file, success) {
    console.log('file input', file);
    var reader = new FileReader();

    reader.onload = function (upload) {
      success(upload.target.result);
      ProfileController.updateProfile({img: upload.target.result});
    }

    reader.readAsDataURL(file);
  }
};
