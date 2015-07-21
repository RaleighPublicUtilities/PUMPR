'use strict';

var _ = require('lodash');
var request = require('request');
var ArcgisToken = require('./arcgisToken.model');
var local = require('../../config/local.env');

// generate a token with your client id and client secret
exports.getToken = function (req, res){
  request.post({
    url: 'http://maps.raleighnc.gov/arcgis/tokens/',
    json:true,
    form: local.AGOL
  }, function(error, response, body){
    if (error){res.send(404);}
    return res.json(200, body).end();
  });
}
