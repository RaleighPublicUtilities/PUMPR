'use strict';

angular.module('pumprApp')
  .controller('AddEngineeringFirmCtrl', ['$scope', 'agsServer', 'addEngineeringFirm', function ($scope, agsServer, addEngineeringFirm) {
    $scope.errors = {};
    $scope.engid;
    $scope.engData =[];
    $scope.error = {
      status: false
    };

    //Default radio button setting
    $scope.eng = {
      active: 1
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
              ENGID: $scope.engid,
              ADDRESS: $scope.eng.address,
              PHONE: $scope.eng.phone,
              EMAIL: $scope.eng.email,
              ACTIVE: $scope.eng.active,
              URL: $scope.eng.url
            }
          }]
        }
      };


      $scope.submitted = true;
      if(form.$valid && !$scope.engid.error) {
        agsServer.ptFs.request(options)
          .then(function(data){
            console.log(data)
            $scope.success = {
              status: true,
              message: 'Add Engineering Firm: Success\nPlease Try Again'
            };
          }, function(err){
            $scope.error = {
              status: true,
              message: 'Add Engineering Firm: Failed\nPlease Try Again'
            };
            angular.element('engview').addClass('animated shake addDocFailure')
          });
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
