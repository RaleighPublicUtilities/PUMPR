'use strict';

angular.module('pumprApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/map', {
        templateUrl: 'app/map/map.html',
        controller: 'MapCtrl'
      })
      .when('/map/:x/:y', {
        templateUrl: 'app/map/map.html',
        controller: 'MapCtrl'
      });
  });
