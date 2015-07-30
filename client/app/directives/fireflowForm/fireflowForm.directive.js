'use strict';

angular.module('pumprApp')
  .directive('fireflowForm', function () {
    return {
      templateUrl: 'app/directives/fireflowForm/fireflowForm.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });