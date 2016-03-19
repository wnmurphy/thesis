var AuthController = {
  initAuth: function () {
    AuthController.signedIn = false;
    var token = localStorage.getItem('token');
    console.log("Auth initialized with token:", token);
    if (token) {
      AuthController.signedIn = true;
      $.ajaxSetup({
        headers: { 'token': token }
      });
    }
  },

  signOut: function () {
    localStorage.removeItem('token');
    AuthController.initAuth();
  },

  sendLogin: function (login, success, fail) {
    $.ajax({
      method: 'POST',
      url: '/api/login',
      dataType: 'json',
      data: login,
      success: function (data) {
        console.log("SUCCESS", data);
        localStorage.setItem('token', JSON.stringify(data.token));
        AuthController.initAuth();
        success();
      },
      error: function (error) {
        AuthController.signOut();
        fail(error.responseText);
      }
    });
  }
};
