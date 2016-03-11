var express = require('express');
var morgan = require('morgan');
var parser = require('body-parser');
var routes = require('./routes.js');

var app = express();

var port = process.env.PORT || 8080;

app.use(morgan('tiny'));
app.use(parser());
app.use('/', express.static(__dirname + '../../client'));

app.listen(port, function() {
  console.log('listening on port', port);
});

routes(app, express);