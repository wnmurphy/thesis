var db = require('../db/db.js');
var helpers = require('./helpers.js');

module.exports = function(app, express, io) {

  // GET to request index.html from root.
  app.get('/', function(req, res) {
    res.sendFile('../../client/index.html');
  });


  // POST to create a new spot from CreateView.
  app.post('/api/create', function(req, res) {
    var spot = req.body;
    helpers.checkToken(JSON.parse(req.headers.token), function (decoded) {
      spot.creatorId = decoded.userId;
      spot.creator = decoded.username;
      helpers.createSpot(spot, function(spot_id) {
        res.json(spot_id);
        io.emit('addSpot');
      }, function(err) {
        res.send(err);
      });
    }, function (message) {
      res.send(404, message);
    });
  });


  // POST to request search results for a specific spot from SearchView.
  app.post('/api/search', function(req, res) {
    var search = req.body.search;
    helpers.search(search, function(results) {
      res.json(results);
    }, function(err) {
      res.send(404);
    });
  });


  // GET to request all spots for either MapView or FeedView.
  app.get('/api/map', function(req, res) {
    var location = req.query.location;
    helpers.getSpots(location, function(results) { //null was location
      res.json(results);
    }, function(err) {
      res.send(404);
    });

  });


  // POST to create a new user from SignupView.
  app.post('/api/signup', function(req, res) {
    var user = {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email
    };

    helpers.signup(user, function(result) {
      //redirect to main page?
      res.json(result);
    }, function(err) {
      res.send(404, message);
    });
  });


  // POST to submit user credentials from LoginView.
  app.post('/api/login', function(req, res) {
    var user = {
      username: req.body.username,
      password: req.body.password
    };

    helpers.signin(user, function(result) {
      res.json(result);
      //res.direct('/#/mainpage', result)
    }, function(message) {
      res.send(404, message);
    });
  });

  // GET to retrieve a user's profile by userId.
  app.get('/api/profile/:id', function(req, res) {
    var id = req.params.id;
    helpers.checkToken(JSON.parse(req.headers.token), function (decoded) {
      var currentUserId = decoded.userId.toString();
      helpers.getProfile(id, function(result) {
        res.json({result: result, currentUser: (id === currentUserId)});
      }, function(err) {
        res.send(404);
      });
    }, function (err) {
      if (id) {
        helpers.getProfile(id, function(result) {
          res.json(result);
        }, function(err) {
          res.send(404);
        });
      } else {
        res.send(404, err);
      }
    });
  });


  // GET to retrieve a spot's information by spotId.
  app.get('/api/spot/:id', function(req, res) {
    var id = Number(req.params.id);

    helpers.getSpot(id, function(result) {
      res.json(result);
    }, function(err) {
      res.send(404);
    });
  });

  // Sockets

  io.sockets.on('connection', function(socket) {

    /* Spot socket */

    // Listen for whenever a new spot is created, and
    // broadcast spotAdded event to trigger client-side map refresh.
    io.on('addSpot', function(){
      io.emit('spotAdded');
    });


    /* Chat socket */

    // Listen for whenever a chat message is sent.
    io.on('chatMessage', function(spotId, user, message){
      io.emit('chatMessage', spotId, user, message);
    });

  });

};
