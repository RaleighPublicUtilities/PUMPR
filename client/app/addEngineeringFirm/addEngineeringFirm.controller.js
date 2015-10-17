/**
 * addEngineeringFirm Controller
 * @namespace Controller
 * @desc Adds new engineering firms to table
 */

(function(){
  'use strict';
  angular
    .module('pumprApp')
    .controller('AddEngineeringFirmCtrl', AddEngineeringFirmCtrl);

    AddEngineeringFirmCtrl.$inject = ['$scope', 'agsServer', 'addEngineeringFirm'];

    function AddEngineeringFirmCtrl($scope, agsServer, addEngineeringFirm) {
      var vm = this;
      vm.form;
      vm.addFirm = addFirm;
      vm.eng = {
        active: 1
      };
      vm.engid = undefined;
      vm.engData =[];
      vm.error = {
        status: false
      };
      vm.errors = {};
      vm.findAddress = findAddress;
      vm.reset = reset;
      vm.searchControl = searchControl;

      activate();

      function activate() {
        vm.engtable = addEngineeringFirm.getAll()
          .then(function(res){
            addEngineeringFirm.setTable(res.features, function(tableData){
              vm.totalfirms = tableData.length;
              vm.numberofpages = Math.ceil(vm.totalfirms / 10);
              vm.engData = tableData;
            });
          }, function(err){
              vm.error = {
              status: true,
              message: 'Whoops..Failed to load data to server\nplease try again'
            };
          });
      }

      //Add engineering firm to db
      function addFirm(form) {
        addEngineeringFirm.generateId(vm.eng.name, function(engid){
          addEngineeringFirm.checkId(engid, function(eId){
            vm.engid = eId;

          var options = {
            layer: 'RPUD.ENGINEERINGFIRM',
            actions: 'addFeatures',
            timeout: 30000,
            params: {
              f: 'json',
              features: [{attributes:
                {
                  FULLNAME: vm.eng.name,
                  SIMPLIFIEDNAME: vm.eng.simp,
                  ENGID: vm.engid,
                  ADDRESS: vm.eng.address,
                  PHONE: vm.eng.phone,
                  EMAIL: vm.eng.email,
                  ACTIVE: vm.eng.active,
                  URL: vm.eng.url
                }
              }]
            }
          };


          vm.submitted = true;
          if(form.$valid && !vm.engid.error) {
            vm.engPromise = agsServer.ptFs.request(options)
              .then(function(data){
                vm.success = {
                  status: true,
                  message: 'Engineering Firm added'
                };
                vm.reset();
              }, function(err){
                vm.error = {
                  status: true,
                  message: 'Add Engineering Firm: Failed\nPlease Try Again'
                };
                angular.element('engview').addClass('animated shake addDocFailure');
              });
            }
            else {
              vm.error = {
                status: true,
                message: 'Please Check Name for Proper Formatting'
              };
            }
          });
        });
    	}

      //Finds matching addesses in address feature class
      function findAddress(typed) {
        var options, attr;
        typed = typed.toUpperCase();
        options = {
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
        vm.addressPromise = agsServer.addressesMs.request(options);
        return vm.addressPromise
          .then(function(data) {
            if (data.error) {
              console.error(data.error);
            }
            else {
              return data.features.map(function(item) {
                attr = item.attributes;
                return attr.ADDRESSU + ', ' +  attr.CITY + ', ' +  attr.STATE + ', ' +  attr.ZIP;
            });
            }
          })
          .catch(function(err) {
            console.error(err);
          });
      }

      //Resets form after submit
      function reset() {
        vm.eng = {
          active: 1
        };
      }

      function searchControl(item) {
        vm.eng.address = item;
      }
    }

})();
