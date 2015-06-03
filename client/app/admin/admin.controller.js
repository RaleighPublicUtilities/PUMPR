'use strict';

angular.module('pumprApp')
  .controller('AdminCtrl', function ($scope, $http, Auth, User) {

    // Use the User $resource to fetch all users
    $scope.users = User.query();
  
    $scope.delete = function(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function(u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    };

    $scope.roles = [{role: 'admin'}, {role:'superuser'}, {role:'user'}];
    // $scope.selectedRole;

    $scope.changeRole = function(user, role){
      var targ;
      if (!e) var e = window.event;
      if (e.target) targ = e.target;
      else if (e.srcElement) targ = e.srcElement;
      // defeat Safari bug
      if (targ.nodeType == 3){
        targ = targ.parentNode;
      }

      user.newRole = role;

      Auth.changeRole(user)
        .then( function() {
          angular.element(targ).addClass('role-success');
        })
        .catch( function() {
          angular.element(targ).addClass('role-failure');
        });
    };

  });
