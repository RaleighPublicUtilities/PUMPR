'use strict';

angular.module('pumprApp')
  .directive('leafletPop', function () {
    return {
      templateUrl: 'app/directives/leafletPop/leafletPop.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });