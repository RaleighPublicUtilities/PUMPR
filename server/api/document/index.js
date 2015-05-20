'use strict';

var express = require('express'),
    auth = require('../../auth/auth.service'),
    controller = require('./document.controller'),
    bodyParser = require('body-parser'),
    multer  = require('multer'),
    fs = require('fs');

var router = express.Router();


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
    return filename;
  },
  //Creates new directory
  onFileUploadStart: function(file, req, res){
    var folder = file.path.split('.')[0].split('-')[0];
    fs.mkdir(folder, function(err){
      if (err) return;
    });
  },
  //Add new file to proper directory
  onFileUploadComplete: function (file) {
    var folder = file.path.split('.')[0].split('-')[0];
    //Creates Read Stream to uploaded file
      var source = fs.createReadStream(file.path);
    //Sets the destination and creates write stream to that loacation
      var dest = fs.createWriteStream(folder + '/' + file.name);
    //Pipes  the source data to the destination
      source.pipe(dest);
      //Report data transfer
      source.on('data', function(chunk) {
          console.log('got %d bytes of data', chunk.length);
        });
        //Deletes original after readstream closes
        source.on('end', function(){
          console.log('File Copied:' + file.name);
          //Deletes Original
          fs.unlink(file.path, function (err){
            if (err) throw err;
            console.log('successfully deleted ' + file.path);
          });
        });
        source.on('error', function(err){
          console.log(err);
          if(err) throw err;
        });
  },
  onError: function (error, next) {
    console.log(error);
    next(error);
  }
  
}));

  router.get('/', controller.exisits);
  router.get('/download', controller.download);
  router.post('/', auth.isAuthenticated(), controller.upload);
// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
// router.delete('/:id', controller.destroy);

module.exports = router;
