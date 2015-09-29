(function(){
  'use strict';
  angular
    .module('pumprApp')
    .controller('AddEngineeringFirmCtrl', AddEngineeringFirmCtrl); ['$scope', 'agsServer', 'addEngineeringFirm', function ($scope, agsServer, addEngineeringFirm) {

      AddEngineeringFirmCtrl.$inject = ['$scope', 'agsServer', 'addEngineeringFirm'];

    function AddEngineeringFirmCtrl($scope, agsServer, addEngineeringFirm) {
      var self = this;
      
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

      function reset() {
        $scope.eng = {
          active: 1
        };
      }

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
            timeout: 30000,
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
            $scope.engPromise = agsServer.ptFs.request(options)
              .then(function(data){
                $scope.success = {
                  status: true,
                  message: 'Engineering Firm added'
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

      $scope.findAddress = function (typed){
        var typed = typed.toUpperCase();
        var options = {
          layer: 'Addresses',
          geojson: false,
          actions: 'query',
          params: {
            f: 'json',
            outFields: 'ADDRESSU, CITY, STATE, ZIP',
            where: "ADDRESSU like '%" +typed + "%'",
            returnGeometry: false,
            orderByFields: 'ADDRESSU ASC'
          }
        };
        $scope.addressPromise = agsServer.addressesMs.request(options);
        return $scope.addressPromise
          .then(function(data){
            if (data.error){
              console.log(data.error);
            }
            else {
              return data.features.map(function(item){
                return item.attributes.ADDRESSU + ', ' +  item.attributes.CITY + ', ' +  item.attributes.STATE + ', ' +  item.attributes.ZIP;
            });
            }
          })
          .catch(function(err){
            console.log(err);
          });
      };

      $scope.searchControl = function (item){
        // var address = item.split(',')[0].trim();
        $scope.eng.address = item;
      }
    }

})();
