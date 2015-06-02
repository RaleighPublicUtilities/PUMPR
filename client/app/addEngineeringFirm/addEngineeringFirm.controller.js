'use strict';

angular.module('pumprApp')
  .controller('AddEngineeringFirmCtrl', ['$scope', 'agsServer', 'addEngineeringFirm', function ($scope, agsServer, addEngineeringFirm) {
    $scope.errors = {};
    $scope.engid;
    $scope.engData =[];
    $scope.error = false;

    $scope.engtable = addEngineeringFirm.getAll()
      .then(function(res){
        addEngineeringFirm.setTable(res.features, function(tableData){
          $scope.totalfirms = tableData.length;
          $scope.numberofpages = Math.ceil($scope.totalfirms / 10);
          $scope.pages = [];
          for (var i = 0; i < $scope.numberofpages; i++){
            $scope.pages.push(i + 1);
          }
          $scope.engData = tableData;
        });
      }, function(err){
        $scope.error = true;
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
