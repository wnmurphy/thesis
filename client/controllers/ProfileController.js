var ProfileController = {
  getProfile: function (id, success, fail) {
    // Should be sending an ajax call to the server.
    if (id) {
      var dummyProfile = {
        userId: 1,
        username: "pazcantina",
        bio: "Paz Cantina brings modern Mexican taqueria fare to South Phoenix and the surrounding area! We come to you! Follow us on irl to see where our fabulous food truck's headed next, or join us onsite for cocktails and tacos on the patio at 419 E Roosevelt St, Phoenix, AZ 85004.",
        img: "https://scontent.xx.fbcdn.net/hphotos-xap1/v/t1.0-9/12308387_1661898610761469_1862990697888107369_n.jpg?oh=4d475475993d156150e1ae93e3195c75&oe=577EC233",
        followers: 723,
        spots: 642
      };
    } else {
      var dummyProfile = {};
    }


    success(dummyProfile);
  }
};
