/**
 * Main application file
 */

'use strict';

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mongoose = require('mongoose');
var mssql = require('mssql');
var local = require('./config/local.env');
var config = require('./config/environment');


// Connect to database
mssql.connect(local.SQLSERVER)
  .then(function(){
    mssql.isConnected = true;
  })
  .catch(function(err){
    console.log('Connect err: ' + err); return;
  });

mongoose.connect(config.mongo.uri, config.mongo.options);

// Populate DB with sample data
if(config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = require('http').createServer(app);
require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
