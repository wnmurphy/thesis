var FeedController = {
  getSpots: function(success, fail) {
    //dummy info
    success({savedSpots: [{
        'creator': 'baBell', 
        'name': 'partay', 
        'category': 'Entertainment', 
        'start': '09:00'
      }], followedUsersSpots: [{
        'creator': 'michelle', 
        'name': 'samples', 
        'category': 'Food', 
        'start': '12:00'
      }]}); 

   //need to update server-side to give saved spots and spots from followed users to this api call
    // $.ajax({
    //   method: 'GET',
    //   url: '/api/feed/' + localStorage.getItem('userId'),
    //   dataType: 'json',
    //   success: function (data) {
    //     console.log("SUCCESS RETRIEVED FEED SPOTS =============>", data);
    //     success(data);
    //   },
    //   error: function (error) {
    //     fail(error.responseText);
    //   }
    // });
  }
};