'use strict';

angular.module('pumprApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/addEngineeringFirm', {
        templateUrl: 'app/addEngineeringFirm/addEngineeringFirm.html',
        controller: 'AddEngineeringFirmCtrl'
      });
  });
