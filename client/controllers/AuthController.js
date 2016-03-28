//  Handles authentication-related functions.
var AuthController = {

  initAuth: function (callback) {
    AuthController.signedIn = false;
    globalState.userId = localStorage.getItem('userId');

    // Clean out old tokens if no user is signed in.
    if (!globalState.userId) {
      localStorage.removeItem('token');
    }
    var token = localStorage.getItem('token');

    // Include token with all AJAX headers if user is logged in.
    if (token) {
      AuthController.signedIn = true;
      $.ajaxSetup({
        headers: { 'token': token }
      });
    }
  },

  signOut: function (callback) {
    localStorage.removeItem('token');
    AuthController.initAuth();
    window.location.hash = '';
  },

  // POST login information to server for verification.
  sendLogin: function (login, success, fail) {
    $.ajax({
      method: 'POST',
      url: '/api/login',
      dataType: 'json',
      data: login,

      // On credential verification, set local token, userId, and username.
      success: function (data) {
        localStorage.setItem('token', JSON.stringify(data.token));
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', data.username);
        socket.emit('updateSocket', data.userId);
        AuthController.initAuth();
        success();
      },

      // If credentials fail, sign out and send error.
      error: function (error) {
        AuthController.signOut();
        fail(error.responseText);
      }
    });
  },

  // POST new user's signup information to server for storage.
  sendSignup: function (user, success, fail) {
    $.ajax({
      method: 'POST',
      url: '/api/signup',
      dataType: 'json',
      data: user,

      // On credential storage, set local token, userId, and username.
      success: function (data) {
        globalState.userId = data.userId;
        localStorage.setItem('token', JSON.stringify(data.token));
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', data.username);
        socket.emit('updateSocket', data.userId);
        AuthController.initAuth();
        success();
      },
      error: function (error) {
        fail(error.responseText);
      }
    });
  }
};
