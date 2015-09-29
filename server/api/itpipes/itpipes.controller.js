'use strict';

var _ = require('lodash');
var mssql = require('mssql');
var ffmpeg = require('fluent-ffmpeg');
var Itpipes = require('./itpipes.model');
var request = require('request');
var fs = require('fs');


exports.streamVideo = function(req, res){
  var myWmv = 'http://telepipeprdapp1.ci.raleigh.nc.us/ITMedia/Mainline/SMH116624SMH112324/2014.09.26_0935/Videos/1_SMH116624_SMH112324.wmv';
  // request
  //   .get(myWmv)
  //   .on('error', function(err) {
  //     console.log(err)
  //   })
  //   .pipe(fs.createWriteStream('temp.wmv'))
  //   .on('finish', function(){
  //     console.log('Downloaded WMV')

      res.contentType('mp4');
      var temp = 'temp.wmv'; //fs.createReadStream('temp.wmv');
      ffmpeg(myWmv)
      .addOption(['-c:v libx264', '-s 320x240', '-crf 23', '-c:a libfaac', '-q:a 100', '-f mp4'])
      // .outputOptions('-f mp4')
      // .outputOptions('-movflags frag_keyframe+empty_moov')
      // .videoCodec('libx264')
      // .audioCodec('libfaac')
      // .output('output.mp4')
      .on('end', function() {
          console.log('file has been converted succesfully');
          fs.createReadStream('output.mp4').pipe(res);
        })
        .on('start', function(cmd) {
          console.log('Started ' + cmd);
        })
        .on('progress', function(progress) {
          console.log('Processing: ' + progress.percent + '% done');
        })
        .on('error', function(err,stdout,stderr) {
          console.log('an error happened: ' + err.message);
          console.log('ffmpeg stdout: ' + stdout);
          console.log('ffmpeg stderr: ' + stderr);
        })
        // save to stream
        .save('output.mp4');
    // })


};


/**
 * Finds ITPipes video base on Sewer Gravity Main Facility ID
 */
exports.findVideo = function(req, res){
  var id, psVid;
    id = req.query.id;
    if (req.query.id === undefined){
      res.status(404).send({message:'Asset Not Found'}).end();
    }
    else {
      //Call prepared statments
      psVid = Itpipes.psVideo;
      psVid.prepare().then(function(){
        psVid.execute({param: id}).then(function(vids){
            if (vids.length === 0){
              res.status(404).send({message:'Asset Not Found'}).end();
            }
            else{
              res.json({
                videos: vids,
              }).end();
            }
            psVid.unprepare(function(err) {
              console.log(err);
            });
          }) // end psVid execute
          .catch(function(err){
             res.status(500).json({ 'Execute Error': err }).end();
             psVid.unprepare(function(err) {
               console.log(err);
             });
           }); //end Prepare Error
        }) //end psVid Prepare
       .catch(function(err){
          res.status(500).json({ 'Prepare Error': err }).end();
          psVid.unprepare(function(err) {
            console.log(err);
          });
        }); //end Prepare Error
    } //end else
};

exports.findImages = function(req, res){
  var id, psImg;
    id = req.query.id;
    if (req.query.id === undefined){
      res.status(404).send({message:'Asset Not Found'}).end();
    }
    else {
      //Call prepared statments
      psImg = Itpipes.psImages;
      psImg.prepare().then(function(){
        psImg.execute({param: id}).then(function(imgs){
            if (imgs.length === 0){
              res.status(404).send({message:'Assets Not Found'}).end();
            }
            else{
              res.json({
                images: imgs,
              }).end();
            }
            psImg.unprepare(function(err) {
              console.log(err);
            });
          }) // end psVid execute
          .catch(function(err){
             res.status(500).json({ 'Execute Error': err }).end();
             psImg.unprepare(function(err) {
               console.log(err);
             });
           }); //end Prepare Error
        }) //end psVid Prepare
       .catch(function(err){
          res.status(500).json({ 'Prepare Error': err }).end();
          psImg.unprepare(function(err) {
            console.log(err);
          });
        }); //end Prepare Error
    } //end else
};

/**
 * Finds ITPipes data base on Sewer Gravity Main Facility ID
 */
exports.find = function(req, res){
  var id, psVid, psImg, re;
  if(mssql.isConnected){
    id = req.query.id;
    //Check inpput
    re = /(SGMN|SFMN)\d{5,6}/.test(id);
    if (id === undefined || !re){
      res.status(200).json({message:'Asset Not Found'}).end();
      return;
    }
    else {
      //Call prepared statments
      psVid = Itpipes.psVideo;
      psImg = Itpipes.psImages;

      psVid.prepare().then(function(){
        psVid.execute({param: id}).then(function(vids){
          psVid.unprepare(function(err) {
            if(err){console.log(err)};
          });


          if (vids.length === 0){
            res.status(200).json({message:'Asset Not Found'}).end();
            return;
          }

          return vids;

        }) // end psVid execute
        .then(function(vids){

          getImgId(vids, function(ids){

           if (ids.length > 0){

              id = ids[0];
              psImg.execute({param: id}).then(function(imgs){
                res.json({
                    videos: vids,
                    images: imgs
                }).end();
              }) //end psImg Execute
              .catch(function(err){
                res.status(500).json({error: err}).end();
               }) // end Execute Error
             } //end if

            else {
              res.json({
                videos: vids,
                images: []
              }).end();
            } //end else

          }); //end getImgId

        }) //end vid promise
      }) //end psVid Prepare
      .catch(function(err){
        res.status(500).json({error: err}).end();
      }); //end Prepare Error
    } //end else
  } //end if
  else {
    res.status(500).json({error: 'Lost Connection'}).end();
  }
}; //end find

function getImgId (vids, cb){
  var ids;
  if (vids.length > 1){
    ids = vids.map(function(vid){
      return vid.MLI_ID;
    });
  }
  else if (vids.length === 1){
    ids = [vids[0].MLI_ID];
  }
  else {
    ids = [];
  }
  cb(ids);
}
