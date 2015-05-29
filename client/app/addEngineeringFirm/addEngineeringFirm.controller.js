'use strict';

angular.module('pumprApp')
  .controller('AddEngineeringFirmCtrl', ['$scope', 'agsServer', function ($scope, agsServer) {
    $scope.errors = {};


    //Generates new ENGID by taking the first letter of each word and concat them, adds next letter to resolve conflicts
    function generateEngId (eng, cb){
      var engid;
      if (typeof eng === 'string'){
        eng = eng.trim().split(' ');
        eng.forEach(function(itme){
          engid+=item.charAt(0);
        });
        return cb(engid);
      }
      else{
        return cb({error: 'Please Enter String'});
      }
    }

    //Checks in generated ENGID is already in use reuturns ture/false
    function checkEngId (engid){
      var options = {
        layer: 'RPUD.ENGINEERINGFIRM',
        actions: 'query',
        params: {
          f: 'json',
          where: "ENGID like '%" + name + "%'",
          outFields: '*',
          orderByFields: 'DOCID ASC',
          returnGeometry: false
        }
      };
    }


    $scope.addEngineeringFirm = function(form) {
      var options = {
        layer: 'RPUD.ENGINEERINGFIRM',
        actions: 'addFeatures',
        params: {
          f: 'json',
          where: "PROJECTNAME like '%" + $scope.eng.name + "%' OR DEVPLANID like '%" + $scope.eng.simp + "%'",
          outFields: '*',
          orderByFields: 'DOCID ASC',
          returnGeometry: false
        }
      };


      $scope.submitted = true;
      if(form.$valid) {
        agsServer.ptFs.request(options).then(function(data){});
      }
		};
  }]);
