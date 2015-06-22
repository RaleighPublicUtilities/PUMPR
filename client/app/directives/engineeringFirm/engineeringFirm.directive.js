'use strict';

angular.module('pumprApp')
  .directive('engineeringFirm', function (addEngineeringFirm) {
    return {
      templateUrl: 'app/directives/engineeringFirm/engineeringFirm.html',
      restrict: 'E',
      transclude: true,
      scope: {
        firm: '='
      },
      link: function (scope, element, attrs) {
        scope.$watch('firm', function(newVal){
          if (scope.firm !== undefined){
            console.log(scope.firm);
            scope.engPromise = addEngineeringFirm.findOne(scope.firm)
              .then(function(data){
                console.log(data.features[0]);
                scope.eng = data.features[0].attributes;
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
