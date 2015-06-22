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
        
        scope.reload = function(){
          document.location.reload();
        }

      }
    };
  });
