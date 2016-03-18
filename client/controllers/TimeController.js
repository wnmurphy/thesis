var getTime = function() {
  var date = new Date();
  var hours = date.getHours().toString();
  var minutes = date.getMinutes().toString();
  if (hours.length < 2) {
    hours = '0' + hours;
  }
  if (minutes.length < 2) {
    minutes = '0' + minutes;
  }
  return hours + minutes;
};