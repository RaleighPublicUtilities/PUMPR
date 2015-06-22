'use strict';

angular.module('pumprApp')
  .directive('errorMessage', function () {
    return {
      templateUrl: 'app/directives/errorMessage/errorMessage.html',
      restrict: 'E',
      transclude: true,
      scope: {
        error: '='
      },
      link: function (scope, element, attrs) {
        console.log(scope.error);
        scope.reload = function(){
          document.location.reload();
        }

      }
    };
  });
