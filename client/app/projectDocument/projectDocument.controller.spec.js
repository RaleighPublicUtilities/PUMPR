'use strict';

describe('Controller: ProjectDocumentCtrl', function () {

  // load the controller's module
  beforeEach(module('pumprApp'));

  var ProjectDocumentCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProjectDocumentCtrl = $controller('ProjectDocumentCtrl', {
      $scope: scope
    });
  }));

  it('should navigate to first document in list', function () {
      // var $scope = {};
      // var controller = $controller('ProjectDocumentCtrl', { $scope: $scope });
      // $scope.password = 'longerthaneightchars';
      // $scope.grade();
      // expect($scope.strength).toEqual('strong');
  });
});
