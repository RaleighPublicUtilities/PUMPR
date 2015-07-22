'use strict';

angular.module('pumprApp')
  .directive('fireflow', function () {
    return {
      templateUrl: 'app/directives/fireflow/fireflow.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });