'use strict';

angular.module('pumprApp')
  .directive('addressSearch', function (agsServer) {
    return {
      templateUrl: 'app/directives/addressSearch/addressSearch.html',
      transclude: true,
      restrict: 'E',
      scope: {
        value: '=ngModel'
      },
      link: function (scope) {

        scope.findAddress = function (typed){
          console.log(typed)
          var typed = typed.toUpperCase();
          var options = {
            layer: 'Addresses',
            geojson: false,
            actions: 'query',
            timeout: 30000,
            params: {
              f: 'json',
              outFields: 'ADDRESSU, CITY, STATE, ZIP',
              where: "ADDRESSU like '%" +typed + "%'",
              returnGeometry: false,
              orderByFields: 'ADDRESSU ASC'
            }
          };
          scope.addressPromise = agsServer.addressesMs.request(options);
          return scope.addressPromise
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

        scope.searchControl = function (item){
          scope.value = item;
        }

      }
    };
  });
