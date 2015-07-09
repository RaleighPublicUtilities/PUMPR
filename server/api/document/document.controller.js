'use strict';

var _ = require('lodash');
var Document = require('./document.model');
var fs = require('fs');
var path = require('path');

exports.exists = function(req, res){

  if (req.query.filename === undefined){
    res.status(404).json({'error': 'File Not Found', 'exists': false}).end();
  }
  else {
  //Sets up response data
  var data = {
      filename: req.query.filename,
      folder : req.query.filename.split('-')[0],
      exists: false
    };
  //Checks if the file exisits
  fs.readdir(path.join('public/documents', data.folder), function (err, files){
    if (err){
      res.status(200).json(data).end();
    }
    var file;
    if(Array.isArray(files) && files.length !== 0){
      for (var i = 0, len = files.length; i < len; i++){
        file = files[i].split('.')[0];
        if(data.filename === file){
          data.exists = true;
          break;
        }
      }
      res.status(200).json(data).end();
    }

  });
  }
};

//Used to upload images to server
exports.upload = function(req, res){
  res.json(req.file);
};

//Updates document name when doctypeid field is changed in table
exports.updateName = function(req, res){
  var newId,
      originalId = req.params.documentid,
      docType = req.body.params.docType,
      split = originalId.split('-'),
      dir = path.join('public/documents', split[0]),
      oldPath = path.join(dir, originalId + '.pdf'),
      newPath;

      if (Array.isArray(split) && split.length === 3){
        newId = [split[0], docType, split[2]].join('-');
        newPath = path.join(dir, newId + '.pdf');
        fs.rename(oldPath, newPath, function(err){
          if (err) {
            res.status(404).json({ message: 'Document not renamed', error: err}).end();
          }
          else {
            res.status(200).json({update: newId, original: originalId}).end();
          }
        });
      }
      else {
        res.status(404).json({ error: 'Document does not exist' }).end();
      }

};

//Used to download
exports.download = function(req, res){
  var file, dir, data, i, len;
  if (req.query.filename === undefined){
    res.status(404).json({'error': 'File Not Found', 'exists': false}).end();
  }
  else {
  //Sets up response data
   data = {
      filename: req.query.filename,
      folder : req.query.filename.split('-')[0],
      exists: false
    };

   dir = path.join('public/documents', data.folder);

    fs.readdir(dir, function (err, files){
      if (err){
        res.status(200).json(data).end();
      }
      else {

        for (i = 0, len = files.length; i < len; i++){
          file = files[i].split('.')[0];
          if(data.filename === file){
            res.download(path.join(dir, files[i]));
          }
        }
      }
    });

  }
};

exports.send = function(req, res, next){
  var projectid = req.params.projectid,
      documentid = req.params.documentid,
      dir = path.join('public/documents', projectid),
      file = documentid + '.pdf',
      fileInfo,
      options;

      fs.stat(path.join(dir, file), function(err, stats){
        if (err){
          res.status(404);
          res.json({'message':'Sorry, we cannot find that!'}).end();
        }
        else{
          options = {
            root: path.join(__dirname, '../../', dir),
            dotfiles: 'deny',
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Length': stats.size
            }
          };

          res.sendfile(file, options, function (err) {
            if (err) {
              res.json({'message':'Sorry, we cannot find that!'}).end();
              res.status(err.status).end();
            }
            else {
              console.log('IP:', req.ip, 'Sent:', file);
            }
          });
        }


      });


};



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
