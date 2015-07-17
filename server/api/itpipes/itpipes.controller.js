'use strict';

var _ = require('lodash');
var mssql = require('mssql');
var Itpipes = require('./itpipes.model');

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
  var id, psVid, psImg;
  if(mssql.isConnected){
    id = req.query.id;
    if (req.query.id === undefined){
      res.status(404).send({message:'Asset Not Found'}).end();
    }
    else {
      //Call prepared statments
      psVid = Itpipes.psVideo;
      psImg = Itpipes.psImages;

      psVid.prepare().then(function(){
        psVid.execute({param: id}).then(function(vids){

          if (vids.length === 0){
            res.status(404).send({message:'Asset Not Found'}).end();
          }

          psVid.unprepare(function(err) {
            if(err){console.log(err)};
          });

          return vids

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
