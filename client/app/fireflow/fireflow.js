'use strict';

angular.module('pumprApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/fireflow', {
        templateUrl: 'app/fireflow/fireflow.html',
        controller: 'FireflowCtrl'
      });
  });
