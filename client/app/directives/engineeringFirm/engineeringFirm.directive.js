'use strict';

angular.module('pumprApp')
  .directive('engineeringFirm', function (addEngineeringFirm) {
    return {
      templateUrl: 'app/directives/engineeringFirm/engineeringFirm.html',
      restrict: 'E',
      transclude: true,
      scope: {
        firms: '='
      },
      link: function (scope, element, attrs) {
        scope.$watch('firms', function(newVal){
          scope.errorMessage = false;
          scope.noEngMessage = false;
          if (scope.firms !== undefined){
            scope.engPromise = addEngineeringFirm.getList(scope.firms)
              .then(function(data){
                if (data.error){
                  scope.errorMessage = true;
                }
                else if (Array.isArray(data.features) && data.features.length){
                  scope.engs = data.features;
                }
                else {
                  scope.noEngMessage = true;
                }
              })
              .catch(function(err){
                scope.errorMessage = true;
              });
          }

        });

      }
    };
  });
