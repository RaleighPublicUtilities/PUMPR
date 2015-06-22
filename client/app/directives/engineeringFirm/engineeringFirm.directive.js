'use strict';

angular.module('pumprApp')
  .directive('engineeringFirm', function () {
    return {
      templateUrl: 'app/directives/engineeringFirm/engineeringFirm.html',
      restrict: 'EA',
      scope: {
        firm: '='
      },
      link: function (scope, element, attrs) {

      }
    };
  });
