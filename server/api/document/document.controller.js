'use strict';

var _ = require('lodash');
var Document = require('./document.model');
var fs = require('fs');

exports.exisits = function(req, res){
  //Sets up response data
  var data = {
      filename: req.query.filename,
      folder : req.query.filename.split('-')[0]
    };
  //Checks if the file exisits
  fs.stat('./public/documents/' + data.folder + '/' + data.filename, function (err, stats){
    if (err) {
      data.exisits = false;
      res.json(data)
    }
    else if (stats.isFile()){
      data.exisits = true;
      res.json(data);
    }
  });
  console.log('Request made with query ' + data.filename);
};

//Used to upload images to server
exports.upload = function(req, res){
  res.json(req.file);
};

// Get list of documents
exports.index = function(req, res) {
  Document.find(function (err, documents) {
    if(err) { return handleError(res, err); }
    return res.json(200, documents);
  });
};

// Get a single document
exports.show = function(req, res) {
  Document.findById(req.params.id, function (err, document) {
    if(err) { return handleError(res, err); }
    if(!document) { return res.send(404); }
    return res.json(document);
  });
};

// Creates a new document in the DB.
exports.create = function(req, res) {
  Document.create(req.body, function(err, document) {
    if(err) { return handleError(res, err); }
    return res.json(201, document);
  });
};

// Updates an existing document in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Document.findById(req.params.id, function (err, document) {
    if (err) { return handleError(res, err); }
    if(!document) { return res.send(404); }
    var updated = _.merge(document, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, document);
    });
  });
};

// Deletes a document from the DB.
exports.destroy = function(req, res) {
  Document.findById(req.params.id, function (err, document) {
    if(err) { return handleError(res, err); }
    if(!document) { return res.send(404); }
    document.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
