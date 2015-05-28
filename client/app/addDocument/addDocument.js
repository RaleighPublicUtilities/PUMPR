'use strict';

angular.module('pumprApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/addDocument', {
        templateUrl: 'app/addDocument/addDocument.html',
        controller: 'AddDocumentCtrl',
        authenticate: true
      })
      .when('/addDocument/:projectid', {
        templateUrl: 'app/addDocument/addDocument.html',
        controller: 'AddDocumentCtrl',
        authenticate: true
      });;
  });
