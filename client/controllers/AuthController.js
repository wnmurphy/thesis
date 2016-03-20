var AuthController = {
  initAuth: function () {
    AuthController.signedIn = false;
    globalState.userId = localStorage.getItem('userId');
    if (!globalState.userId) localStorage.removeItem('token');
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
        localStorage.setItem('userId', data.userId);
        AuthController.initAuth();
        success();
      },
      error: function (error) {
        AuthController.signOut();
        fail(error.responseText);
      }
    });
  },

  sendSignup: function (user, success, fail) {
    $.ajax({
      method: 'POST',
      url: '/api/signup',
      dataType: 'json',
      data: user,
      success: function (data) {
        globalState.userId = data.userId;
        localStorage.setItem('token', JSON.stringify(data.token));
        AuthController.initAuth();
        success();
      },
      error: function (error) {
        fail(error.responseText);
      }
    });
  }
};
