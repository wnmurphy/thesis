var db = require('../db/db.js');
var helpers = require('./helpers.js');

// Socket.io
var http = require('http').Server(app);
var io = require('socket.io')(http);

db;

module.exports = function(app, express) {


  // GET to request index.html from root.
  app.get('/', function(req, res) {
    res.sendFile('../../client/index.html');
  });


  // POST to create a new spot from CreateView.
  app.post('/api/create', function(req, res) {
    var spot = req.body;

    helpers.createSpot(spot, function(spot_id) {
      res.json(spot_id);
    }, function(err) {
      res.send(err);
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
    // var location = req.params.location; 
    helpers.getSpots(null, function(results) { //null was location
      res.json(results);
    }, function(err) {
      res.send(404);
    });

  });


  // POST to create a new user from SignupView.
  app.post('/api/signup', function(req, res) {
    var user_info = {
      username: req.body.username, 
      password: req.body.password, 
      email: req.body.email
    };

    helpers.signup(user_info, function(result) {
      //redirect to main page?
      res.json(result);
    }, function(err) {
      res.send(404);
    });
  });


  // POST to submit user credentials from LoginView.
  app.post('/api/login', function(req, res) {
    var user_info = {
      username: req.body.username, 
      password: req.body.password
    };

    helpers.signin(user_info, function(result) {
      res.json(result.Items[0].username);
      //res.direct('/#/mainpage', result)
    }, function(err) {
      res.send(404);
    });
  });  


  // GET to retrieve a user's profile by userId.
  app.get('/api/profile/:id', function(req, res) {
    var id = req.params.id;
    helpers.getProfile(id, function(result) {
      res.json(result);
    }, function(err) {
      res.send(404);
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

};