'use strict';

angular.module('pumprApp')
  .directive('itpipes', function () {
    return {
      templateUrl: 'app/directives/itpipes/itpipes.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });