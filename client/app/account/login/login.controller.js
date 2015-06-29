'use strict';

angular.module('pumprApp')
  .controller('LoginCtrl', function ($scope, Auth, $location) {
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          Auth.agolToken().then(function(){
            // Logged in, redirect to home
            $location.path('/');
          })
          .catch( function(err) {
            $scope.errors.other = err.message;
          });
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

  });
