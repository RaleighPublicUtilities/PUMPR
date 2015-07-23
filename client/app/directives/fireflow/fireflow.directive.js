'use strict';

angular.module('pumprApp')
  .directive('fireflow', function (fireflowFactory) {
    return {
      templateUrl: 'app/directives/fireflow/fireflow.html',
      transclude: true,
      restrict: 'E',
      scope: {
        hydrants: '='
      },
      link: function (scope) {
        scope.type= '0% Complete';
        scope.dynamic = 0;
        scope.test;
        scope.flow;

        //Removes record
        scope.remove = fireflowFactory.removeLog;
        
        scope.$watchCollection('hydrants', function(){
          if (Array.isArray(scope.hydrants)){
            switch (scope.hydrants.length){
              case 0:
                break;
              case 1:
                scope.test = scope.hydrants[0];
                scope.dynamic = (1/3) * 100;
                scope.type= '33% Complete';
                break;
              case 2:
                scope.flow = scope.hydrants[1];
                scope.dynamic = (2/3) * 100;
                scope.type= '66% Complete';
                break;
              default:
                return;
            }
          }
        });
      }
    };
  });
