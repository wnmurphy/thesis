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

var timeController = {

  // takes a time string as input and returns a date object for that time today
  timeToDate: function (time) {
    var now = new Date();
    var month = now.getMonth() + 1,
        day = now.getDate(),
        year = now.getFullYear();
    if (now.getHours() > time.split(':')[0]) day++;
    var input = [month, day, year, time].join(" ");
    return new Date(Date.parse(input));
  },

  timeToMS: function (time) {
    return timeController.timeToDate(time).getTime();
  }
}
