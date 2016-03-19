var getLocation = function (callback, context) {
    var currentLocation = {};
    
    navigator.geolocation.getCurrentPosition(function(position){
      currentLocation.latitude = position.coords.latitude;
      currentLocation.longitude = position.coords.longitude;
      globalState.location = currentLocation;
      context.setState({location: currentLocation});
      callback(currentLocation);
      
    }, function(error){
      console.log(error);
  });
};