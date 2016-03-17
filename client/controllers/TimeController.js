var getTime = function() {
  var time;
  var date = new Date();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var meridian;

  if (hours < 12) {
    meridian = 'am';
  } else {
    meridian = 'pm';
  }

  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) {
    hours = 12;
  }

  if (minutes < 10) {
    minutes = '0' + minutes;
  }

  time = hours + ':' + minutes + meridian;
};