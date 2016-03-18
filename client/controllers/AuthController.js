var AuthController = {
  initAuth: function () {
    var token = localStorage.getItem('token');
    console.log("Auth initialized with token:", token);
    if (token) {
      $.ajaxSetup({
        headers: { 'token': token }
      });
    }
  },

  signOut: function () {
    localStorage.removeItem('token');
    AuthController.initAuth();
  },

  sendLogin: function (login, fail) {
    $.ajax({
      method: 'POST',
      url: '/api/login',
      dataType: 'json',
      data: login,
      success: function (data) {
        console.log("SUCCESS", data);
        localStorage.setItem('token', JSON.stringify(data.token));
        AuthController.initAuth();
        window.location.hash = '';
      },
      error: function (error) {
        AuthController.signOut();
        fail(error.responseText);
      }
    })
  }
}
