var FeedController = {
  getSavedSpots: function(success, fail) {
    //dummy info
    success([{
        'creator': 'baBell', 
        'name': 'partay', 
        'category': 'Entertainment', 
        'start': '09:00'
      }]); 

   //need to update server-side to give saved spots and spots from followed users to this api call
    // $.ajax({
    //   method: 'GET',
    //   url: '/api/profile/' + localStorage.getItem('userId'),
    //   dataType: 'json',
    //   success: function (data) {
    //     console.log("SUCCESS RETRIEVED USER'S SAVED SPOTS =============>", data.savedSpots);
    //     success(data.savedSpots);
    //   },
    //   error: function (error) {
    //     fail(error.responseText);
    //   }
    // });
  },
  getFollowedUsersSpots: function (success, fail) {
    //dummy info
    success([{
        'creator': 'michelle', 
        'name': 'samples', 
        'category': 'Food', 
        'start': '12:00'
      }]);
    //write api call to get followed users spots
    // $.ajax({
    //   method: 'GET',
    //   url: '/api/followedUsersSpots/' + localStorage.getItem('userId'),
    //   dataType: 'json',
    //   success: function (data) {
    //     console.log("SUCCESS RETRIEVED FOLLOWED USERS' SPOTS =============>", data);
    //     success(data);
    //   },
    //   error: function (error) {
    //     fail(error.responseText);
    //   }
    // });
  }
};