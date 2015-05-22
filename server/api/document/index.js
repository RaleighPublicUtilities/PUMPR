'use strict';

var express = require('express'),
    auth = require('../../auth/auth.service'),
    controller = require('./document.controller'),
    bodyParser = require('body-parser'),
    multer  = require('multer'),
    path = require('path'),
    fs = require('fs');

var router = express.Router();
var currentFile;

//Route Specific Middleware
//Handles file uploads
router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
router.use(multer({
  dest: './public/documents',
  limits: {
    fileSize: 100000000
  },
  //Sets the file name from optoins
  rename: function (fieldname, filename){
    console.log('File Name: ' + filename);
    currentFile = filename
    return filename;
  },
  changeDest: function(dest, req, res){
    var folder = dest + '/' + currentFile.split('-')[0];
    fs.mkdir(folder, function(err){
      if (err) return;
    });
    return folder;
  },
  onError: function (error, next) {
    console.log(error);
    next(error);
  }

}));

  router.get('/', controller.exisits);
  router.get('/download', controller.download);
  router.post('/', auth.isAuthenticated(), controller.upload);
  router.post('/:id', controller.serve);
// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
// router.delete('/:id', controller.destroy);

module.exports = router;
