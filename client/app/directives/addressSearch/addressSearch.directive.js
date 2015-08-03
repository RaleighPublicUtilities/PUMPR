'use strict';

angular.module('pumprApp')
  .directive('addressSearch', function () {
    return {
      templateUrl: 'app/directives/addressSearch/addressSearch.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });