var express = require('express');
var morgan = require('morgan');
var parser = require('body-parser');
var routes = require('./routes.js');
var env = require('node-env-file');

if(!process.env.TRAVIS) {
  env(__dirname + '../../.env');
}

var app = express();
var port = process.env.PORT || 8080;

app.use(morgan('tiny'));
app.use(parser());
app.use('/', express.static(__dirname + '../../client'));

var server = app.listen(port, function() {
  console.log('listening on port', port);
});

// var http = require('http').Server(app);
// var io = require('socket.io')(http);

var io = require('socket.io')({
 transports: ["xhr-polling"],
 'polling duration': 10
}).listen(server);

routes(app, express, io);
