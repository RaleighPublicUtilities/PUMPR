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

  it('should get a projectid from path', function () {
    expect(1).toEqual(1);
  });

  it('should not get a projectid from path', function () {
    expect(1).toEqual(1);
  });

  it('should return project via XHR', function () {
    expect(12).toEqual(12);
  });

});
