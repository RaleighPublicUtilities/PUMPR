'use strict';

angular.module('pumprApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/project/:projectid/:docid', {
        templateUrl: 'app/projectDocument/projectDocument.html',
        controller: 'ProjectDocumentCtrl'
      });
  });
