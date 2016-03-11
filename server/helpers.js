module.exports = {

  createSpot: function(spot, success, fail) {
    success(1);
  },
  search: function(search, success, fail) {
    success(2);
  },
  getSpots: function(location, success, fail) {
    success(3);
  },
  signup: function(info, success, fail) {
    success(4);
  },
  signin: function(info, success, fail) {
    success(5);
  },
  getProfile: function(username, success, fail) {
    success(6);
  },
  getSpot: function(id, success, fail) {
    success(7);
  }

};