var ProfileController = {
  getProfile: function (id, success, fail) {
    // Should be sending an ajax call to the server.
    if (id) {
      var dummyProfile = {
        userId: 1,
        username: "jedijashwa",
        bio: "Josh is a full stack developer hosting cool events all over Phoenix!",
        img: "https://pbs.twimg.com/profile_images/667799262827184128/SAymeDag.jpg",
        followers: 127,
        spots: 562
      };
    } else {
      var dummyProfile = {};
    }


    success(dummyProfile);
  }
};
