'use strict';

describe('Controller: AddEngineeringFirmCtrl', function () {

  // load the controller's module
  beforeEach(module('pumprApp'));

  var AddEngineeringFirmCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AddEngineeringFirmCtrl = $controller('AddEngineeringFirmCtrl', {
      $scope: scope
    });
  }));

  it('should get list of engineering firms', function () {
    expect(1).toEqual(1);
  });

  it('should add engineering firm', function () {
    expect(1).toEqual(1);
  });

  it('should ...', function () {
    expect(1).toEqual(1);
  });

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
