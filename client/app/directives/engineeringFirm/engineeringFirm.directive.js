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
          if (scope.firms !== undefined){
            console.log(scope.firm);
            scope.engPromise = addEngineeringFirm.getList(scope.firms)
              .then(function(data){
                console.log(Array.isArray(data.features), data.features.length);
                if(Array.isArray(data.features) && data.features.length){
                  scope.engs = data.features;
                  console.log(scope.engs)
                }

            //     if (data.error){
            //       scope.errorMessage = 'true';
            //     }
            //     scope.firm = data;
              })
            //   .catch(function(err){
            //     scope.errorMessage = 'true';
            //   });
          }

        });

      }
    };
  });
