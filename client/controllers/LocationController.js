var getLocation = function (callback, context) {
    var currentLocation = {};
    
    navigator.geolocation.getCurrentPosition(function(position){
      currentLocation.latitude = position.coords.latitude;
      currentLocation.longitude = position.coords.longitude;
      callback(currentLocation);
      globalState.location = currentLocation;
      context.setState({location: currentLocation});
    }, function(error){
      console.log(error);
  });
};