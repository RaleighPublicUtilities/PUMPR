'use strict';

angular.module('pumprApp')
  .controller('AddEngineeringFirmCtrl', ['$scope', 'agsServer', 'addEngineeringFirm', function ($scope, agsServer, addEngineeringFirm) {
    $scope.errors = {};
    $scope.engid;
    $scope.engData =[];
    $scope.gridOptions = {
      data: 'engData',
      primaryKey: 'ENGID'
    };
    $scope.engtable = addEngineeringFirm.getAll()
      .then(function(res){
        console.log(res);
        addEngineeringFirm.setTable(res.features, function(tableData){
          $scope.engData = tableData;
          console.log($scope.engData)
          $scope.gridOptions = {
            data: 'engData',
            primaryKey: 'ENGID'
          };
        });
      }, function(err){
        console.log(err);
      });

    //Add engineering firm to db
    $scope.addEngineeringFirm = function(form) {

      addEngineeringFirm.generateId($scope.eng.name, function(engid){
        addEngineeringFirm.checkId(engid, function(eId){
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
