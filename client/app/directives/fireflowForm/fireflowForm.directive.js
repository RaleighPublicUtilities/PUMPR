'use strict';

angular.module('pumprApp')
  .directive('fireflowForm', function (agsServer) {
    return {
      templateUrl: 'app/directives/fireflowForm/fireflowForm.html',
      transclude: true,
      restrict: 'E',
      scope: {
        flowData: '='
      },
      link: function (scope) {
        var options = {
          layer: 'FireFlow',
          actions: 'query',
          params: {
            f: 'json',
            where: '1=1',
            outFields: '*',
            returnGeometry: false
          }
        }
        agsServer.ptFs.request(options)
          .then(function(res){
            console.log(res);
          })
          .catch(function(err){
            console.log(err);
          });

      }
    };
  });
