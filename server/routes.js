var db = require('../db/db.js');
var helpers = require('./helpers.js');

db;

module.exports = function(app, express) {
//home
  app.get('/', function(req, res) {
    res.sendFile('../../client/index.html');
  });

//create
  //post making haps
  app.post('/api/create', function(req, res) {
    var spot = req.body;
    console.log('spot', spot);
    helpers.createSpot(spot, function(spot_id) {
      res.json(spot_id);
    }, function(err) {
      res.send(err);
    });
  });

//search
  //post specific hap
  app.post('/api/search', function(req, res) {
    var search = req.body.params;

    helpers.search(search, function(results) {
      res.json(results);
    }, function(err) {
      res.send(404);
    });
  });  

//feed main page 
  //localhost:8080/feed or map
  //get request
  app.get('/api/feed', function(req, res) {
    var location = req.params.location; 

    helpers.getSpots(location, function(results) {
      res.json(results);
    }, function(err) {
      res.send(404);
    });

  });

//sign-up
  //post
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

//login
  //post
  app.post('/api/login', function(req, res) {
    var user_info = {
      username: req.body.username, 
      password: req.body.password, 
      email: req.body.email
    };

    helpers.signin(user_info, function(result) {
      res.json(result);
    }, function(err) {
      res.send(404);
    });
  });  

//profile
  //post
  app.post('/api/profile', function(req, res) {
    var username = req.body.username;
    
    helpers.getProfile(username, function(result) {
      res.json(result);
    }, function(err) {
      res.send(404);
    });

  });


//commit purpose
//spot
  //get
  app.get('/api/spot/:id', function(req, res) {
    var id = req.params.id;
    console.log(id);
    helpers.getSpot(id, function(result) {
      res.json(result);
    }, function(err) {
      res.send(404);
    });
  });

};