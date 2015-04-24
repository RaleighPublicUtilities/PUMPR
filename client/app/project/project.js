'use strict';

angular.module('pumprApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/project/:projectid', {
        templateUrl: 'app/project/project.html',
        controller: 'ProjectCtrl'
      });
  });
