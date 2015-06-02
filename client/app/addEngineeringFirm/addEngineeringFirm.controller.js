'use strict';

angular.module('pumprApp')
  .controller('AddEngineeringFirmCtrl', ['$scope', 'agsServer', 'addEngineeringFirm', function ($scope, agsServer, addEngineeringFirm) {
    $scope.errors = {};
    $scope.engid;
    $scope.engData =[];
    $scope.error = {
      status: false
    };

    $scope.engtable = addEngineeringFirm.getAll()
      .then(function(res){
        addEngineeringFirm.setTable(res.features, function(tableData){
          $scope.totalfirms = tableData.length;
          $scope.numberofpages = Math.ceil($scope.totalfirms / 10);
          $scope.engData = tableData;
        });
      }, function(err){
        $scope.error = {
          status: true,
          message: 'Whoops..Failed to load data to server\nplease try again'
        };
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
      if(form.$valid && !$scope.engid.error) {
        console.log($scope.engid);
        console.log(options.params.features[0].attributes.ENGID);
        // agsServer.ptFs.request(options).then(function(data){});
      }
      else {
        $scope.error = {
          status: true,
          message: 'Please Check Name for Proper Formatting'
        };
      }
    });
  });
		};

  }]);
