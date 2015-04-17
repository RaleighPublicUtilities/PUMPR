'use strict';

angular.module('pumprApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/addProject', {
        templateUrl: 'app/addProject/addProject.html',
        controller: 'AddProjectCtrl'
      });
  });
