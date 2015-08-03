'use strict';

angular.module('pumprApp')
  .directive('fireflowForm', function (fireflowFactory) {
    return {
      templateUrl: 'app/directives/fireflowForm/fireflowForm.html',
      transclude: true,
      restrict: 'E',
      scope: {
        hydrants: '='
      },
      link: function (scope) {
        scope.flowData = {};
        scope.$watchCollection('hydrants', function(){
          if (Array.isArray(scope.hydrants) && scope.hydrants.length === 2){
            angular.extend(scope.flowData, {
              TESTID: 1,
              TESTFACILITYID: scope.hydrants[0].message.split(':')[1].trim(),
              FLOWFACILITYID: scope.hydrants[1].message.split(':')[1].trim()
            });
          }
        });


        // fireflowFactory.getForm().then(function(res){
        //     console.log(res);
        //   })
        //   .catch(function(err){
        //     console.log(err);
        //   });

      }
    };
  });
