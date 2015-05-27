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
    var stat = null;
    var folder = dest + '/' + currentFile.split('-')[0];
    try {
        // using fs.statSync; NOTE that fs.existsSync is now deprecated; fs.accessSync could be used but is only nodejs >= v0.12.0
        stat = fs.statSync(folder);
    } catch(err) {
        // for nested folders, look at npm package "mkdirp"
        fs.mkdirSync(folder);
    }
    if (stat && !stat.isDirectory()) {
        // Woh! This file/link/etc already exists, so isn't a directory. Can't save in it. Handle appropriately.
        throw new Error('Directory cannot be created because an inode of a different type exists at "' + folder + '"');
    }
    return folder;
  },
  onError: function (error, next) {
    console.log(error);
    next(error);
  }

}));

  router.get('/', controller.exisits);
  router.get('/download', controller.download);
  router.get('/:projectid/:documentid', controller.send);
  router.post('/', auth.isAuthenticated(), controller.upload);
// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
// router.delete('/:id', controller.destroy);

module.exports = router;
