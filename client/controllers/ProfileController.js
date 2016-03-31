// This controller handles client-server interaction for profile logic.

var ProfileController = {
  // GET profile information from server.
  getProfile: function (id, success, fail) {
    if (id) {
      $.ajax({
        method: 'GET',
        url: '/api/profile/' + id,
        dataType: 'json',
        success: function (data) {
          var user = data.result;
          user.signedIn = data.currentUser;
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

  // PUT updated profile information on server.
  updateProfile: function (profile) {
    $.ajax({
      method: 'PUT',
      url: '/api/profile',
      data: profile,
      success: function (data) {
      },
      error: function (error) {
        console.log(error);
      }
    });
  },

  // Scans incoming image to binary, calls resizeImage, calls update profile to send to server.
  sendImage: function (file, success) {
    var reader = new FileReader();
    var img = document.createElement('img');
    img.className = 'hide';
    reader.onload = function (upload) {
      img.src = upload.target.result;
      ProfileController.resizeImage(img, function (imageDataUrl) {
        success(imageDataUrl);
        ProfileController.updateProfile({img: imageDataUrl});
      });
    };

    reader.readAsDataURL(file);
  },

  resizeImage: function (img, success) {
    var canvas = document.createElement('canvas');
    canvas.className = 'hide';
    var width = 400, height = 400;

    if (img.width > img.height) {
      width *= (img.width / img.height);
    } else {
      height *= (img.height / img.width);
    }

    canvas.height = 400;
    canvas.width = 400;

    var left = (400 - width) / 2;
    var top = (400 - height) / 2;

    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, left, top, width, height);

    var imageDataUrl = canvas.toDataURL("image/jpeg");
    success(imageDataUrl);
  },

  // Send POST request to update list of followed users.
  followUser: function (followId, success, fail) {
    $.ajax({
      method: 'POST',
      url: '/api/followUser/',
      data: {
        "userId": localStorage.getItem('userId'),
        "followUser": followId
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
