'use strict';

var _ = require('lodash');
var Document = require('./document.model');
var fs = require('fs');
var path = require('path');

exports.exisits = function(req, res){
  //Sets up response data
  var data = {
      filename: req.query.filename,
      folder : req.query.filename.split('-')[0],
      exisits: false
    };
  //Checks if the file exisits
  fs.readdir(path.join('public/documents', data.folder), function (err, files){
    if (err){
      res.json(data);
    }
    var file;
    for (var i = 0, len = files.length; i < len; i++){
      file = files[i].split('.')[0];
      if(data.filename === file){
        data.exisits = true;
        break;
      }
    }
    res.json(data);
  });
};

//Used to upload images to server
exports.upload = function(req, res){
  res.json(req.file);
};

//Used to download
exports.download = function(req, res){
  //Sets up response data
  var data = {
      filename: req.query.filename,
      folder : req.query.filename.split('-')[0],
      exisits: false
    };

  var dir = path.join('public/documents', data.folder);
    fs.readdir(dir, function (err, files){
      if (err){
        res.json(data);
      }
      var file;
      for (var i = 0, len = files.length; i < len; i++){
        file = files[i].split('.')[0];
        if(data.filename === file){
          // var filestream = fs.createReadStream(path.join(dir, files[i]));
          // filestream.pipe(res);
          res.download(path.join(dir, files[i]));
        }
      }

    });

}

// Get list of documents
// exports.index = function(req, res) {
//   Document.find(function (err, documents) {
//     if(err) { return handleError(res, err); }
//     return res.json(200, documents);
//   });
// };
//
// // Get a single document
// exports.show = function(req, res) {
//   Document.findById(req.params.id, function (err, document) {
//     if(err) { return handleError(res, err); }
//     if(!document) { return res.send(404); }
//     return res.json(document);
//   });
// };
//
// // Creates a new document in the DB.
// exports.create = function(req, res) {
//   Document.create(req.body, function(err, document) {
//     if(err) { return handleError(res, err); }
//     return res.json(201, document);
//   });
// };
//
// // Updates an existing document in the DB.
// exports.update = function(req, res) {
//   if(req.body._id) { delete req.body._id; }
//   Document.findById(req.params.id, function (err, document) {
//     if (err) { return handleError(res, err); }
//     if(!document) { return res.send(404); }
//     var updated = _.merge(document, req.body);
//     updated.save(function (err) {
//       if (err) { return handleError(res, err); }
//       return res.json(200, document);
//     });
//   });
// };
//
// // Deletes a document from the DB.
// exports.destroy = function(req, res) {
//   Document.findById(req.params.id, function (err, document) {
//     if(err) { return handleError(res, err); }
//     if(!document) { return res.send(404); }
//     document.remove(function(err) {
//       if(err) { return handleError(res, err); }
//       return res.send(204);
//     });
//   });
// };

function handleError(res, err) {
  return res.send(500, err);
}
