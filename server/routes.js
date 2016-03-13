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

    helpers.createSpot(spot, function(spot_id) {
      res.json(spot_id);
    }, function(err) {
      res.send(err);
    });
  });

//search
  //post specific hap
  app.post('/api/search', function(req, res) {
    var search = req.body.search;
    helpers.search(search, function(results) {
      res.json(results);
    }, function(err) {
      res.send(404);
    });
  });  

//feed main page 
  //localhost:8080/feed or map
  //get request
  app.get('/api/map', function(req, res) {
    // var location = req.params.location; 
    helpers.getSpots(null, function(results) { //null was location
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
      password: req.body.password
    };

    helpers.signin(user_info, function(result) {
      res.json(result.Items[0].username);
      //res.direct('/#/mainpage', result)
    }, function(err) {
      res.send(404);
    });
  });  

//profile
  app.get('/api/profile/:id', function(req, res) {
    var id = req.params.id;
    helpers.getProfile(id, function(result) {
      res.json(result);
    }, function(err) {
      res.send(404);
    });

  });


//spot
  //get
  app.get('/api/spot/:id', function(req, res) {
    var id = Number(req.params.id);

    helpers.getSpot(id, function(result) {
      res.json(result);
    }, function(err) {
      res.send(404);
    });
  });

};