var getTime = function() {
  var time = {};
  var date = new Date();
  time.hours = date.getHours();
  time.minutes = date.getMinutes();
  return time;
};