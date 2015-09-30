/**
 * Admin Controller
 * @namespace Controller
 * @desc Allows users to be deleted and have roles changed
 */

(function() {
  'use strict';

  angular
    .module('pumprApp')
    .controller('AdminCtrl', AdminCtrl);

    AdminCtrl.$inject = ['$scope', '$http', 'Auth', 'User'];

  function AdminCtrl($scope, $http, Auth, User) {
    var self = this;

    $scope.roles = [
      {role: 'admin'},
      {role:'superuser'},
      {role: 'eng'},
      {role: 'fireflow'},
      {role:'user'}
    ];
    $scope.delete = deleteUser;
    $scope.changeRole = changeRole;
    $scope.users = User.query();

    //changes users role
    function changeRole(user, role){
      var targ, e;
      if (!e) {
        e = window.event;
      }
      if (e.target) {
        targ = e.target;
      }
      else if (e.srcElement) {
        targ = e.srcElement;
      }
      // defeat Safari bug
      if (targ.nodeType === 3){
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
    }

    //Delete user
    function deleteUser(user) {
      User.remove({ id: user._id });
      angular.forEach($scope.users, function(u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    }
  }
})();
