'use strict';

angular.module('pumprApp')
  .controller('AddEngineeringFirmCtrl', ['$scope', 'agsServer', function ($scope, agsServer) {
    $scope.errors = {};
    $scope.engid;

    //Generates new ENGID by taking the first letter of each word and concat them, adds next letter to resolve conflicts
    function generateEngId (eng, cb){
      var engid = '';
      var whiteList = /[A-Z]/;
      if (typeof eng === 'string'){
        eng = eng.trim().split(' ');
        eng.forEach(function(item){
          if(whiteList.test(item.charAt(0))){
            engid+=item.charAt(0);
          };
        });
        return cb(engid);
      }
      else{
        return cb({error: 'Please Enter String'});
      }
    }

    //Checks in generated ENGID is already in use reuturns ture/false
    function checkEngId (engid, cb){
      if (typeof engid === 'object'){
        cb(engid);
      }
      var options = {
        layer: 'RPUD.ENGINEERINGFIRM',
        actions: 'query',
        params: {
          f: 'json',
          where: "ENGID = '" + engid + "'",
          outFields: 'ENGID'
        }
      };

        agsServer.ptFs.request(options).then(function(data){
          if (data.features.length === 0){
            cb(engid);
          }
          else {
            engid+=engid.charAt(0);
            checkEngId(engid, function(a){
              cb(a);
            });
          }
        }, function(err){
          console.log(err);
          cb(err);
        });

    }

    //Add engineering firm to db
    $scope.addEngineeringFirm = function(form) {

      generateEngId($scope.eng.name, function(engid){
        checkEngId(engid, function(eId){
          $scope.engid = eId;


      var options = {
        layer: 'RPUD.ENGINEERINGFIRM',
        actions: 'addFeatures',
        params: {
          f: 'json',
          features: [{attributes:
            {
              FULLNAME: $scope.eng.name,
              SIMPLIFIEDNAME: $scope.eng.simp,
              ENGID: $scope.engid
            }
          }]
        }
      };


      $scope.submitted = true;
      if(form.$valid) {
        console.log($scope.engid);
        console.log(options.params.features[0].attributes.ENGID);
        // agsServer.ptFs.request(options).then(function(data){});
      }
    });
  });
		};
  }]);
