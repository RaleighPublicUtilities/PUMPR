'use strict';

var _ = require('lodash');
var Itpipes = require('./itpipes.model');

// Get list of itpipess
exports.index = function(req, res) {
  Itpipes.find(function (err, itpipess) {
    if(err) { return handleError(res, err); }
    return res.json(200, itpipess);
  });
};

// Get a single itpipes
exports.show = function(req, res) {
  Itpipes.findById(req.params.id, function (err, itpipes) {
    if(err) { return handleError(res, err); }
    if(!itpipes) { return res.send(404); }
    return res.json(itpipes);
  });
};

// Creates a new itpipes in the DB.
exports.create = function(req, res) {
  Itpipes.create(req.body, function(err, itpipes) {
    if(err) { return handleError(res, err); }
    return res.json(201, itpipes);
  });
};

// Updates an existing itpipes in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Itpipes.findById(req.params.id, function (err, itpipes) {
    if (err) { return handleError(res, err); }
    if(!itpipes) { return res.send(404); }
    var updated = _.merge(itpipes, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, itpipes);
    });
  });
};

// Deletes a itpipes from the DB.
exports.destroy = function(req, res) {
  Itpipes.findById(req.params.id, function (err, itpipes) {
    if(err) { return handleError(res, err); }
    if(!itpipes) { return res.send(404); }
    itpipes.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}