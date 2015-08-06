'use strict';

angular.module('pumprApp')
  .directive('fireflowForm', function (fireflowFactory, Auth) {
    return {
      templateUrl: 'app/directives/fireflowForm/fireflowForm.html',
      transclude: true,
      restrict: 'E',
      scope: {
        hydrants: '='
      },
      link: function (scope) {
        var user = Auth.getCurrentUser();
        scope.goBack = fireflowFactory.setFormStatus;
        scope.flowData = {};
        scope.$watchCollection('hydrants', function(){
          if (Array.isArray(scope.hydrants) && scope.hydrants.length === 2){
            angular.extend(scope.flowData, {
              TESTFACILITYID: scope.hydrants[0].message.split(':')[1].trim(),
              FLOWFACILITYID: scope.hydrants[1].message.split(':')[1].trim(),
              APPLICANTNAME: user.name,
              CONTACTEMAIL: user.email
            });
          }
        });

        // scope.findAddress = function (typed){
        //   var typed = typed.toUpperCase();
        //   var options = {
        //     layer: 'Addresses',
        //     geojson: false,
        //     actions: 'query',
        //     params: {
        //       f: 'json',
        //       outFields: 'ADDRESSU, CITY, STATE, ZIP',
        //       where: "ADDRESSU like '%" +typed + "%'",
        //       returnGeometry: false,
        //       orderByFields: 'ADDRESSU ASC'
        //     }
        //   };
        //   scope.addressPromise = agsServer.addressesMs.request(options);
        //   return scope.addressPromise
        //     .then(function(data){
        //       if (data.error){
        //         console.log(data.error);
        //       }
        //       else {
        //         return data.features.map(function(item){
        //           return item.attributes.ADDRESSU + ', ' +  item.attributes.CITY + ', ' +  item.attributes.STATE + ', ' +  item.attributes.ZIP;
        //       });
        //       }
        //     })
        //     .catch(function(err){
        //       console.log(err);
        //     });
        // };
        //
        // scope.searchControl = function (item){
        //   scope.flowData.ADDRESS = item;
        // }

        // fireflowFactory.getForm().then(function(res){
        //     console.log(res);
        //   })
        //   .catch(function(err){
        //     console.log(err);
        //   });

      }
    };
  });
