var getTime = function() {
  var date = new Date();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  return Number(hours.toString() + minutes.toString());
};