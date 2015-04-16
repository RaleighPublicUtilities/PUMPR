'use strict';

describe('Controller: AddDocumentCtrl', function () {

  // load the controller's module
  beforeEach(module('pumprApp'));

  var AddDocumentCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AddDocumentCtrl = $controller('AddDocumentCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
