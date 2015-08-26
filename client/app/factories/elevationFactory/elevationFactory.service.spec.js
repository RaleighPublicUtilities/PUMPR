'use strict';

describe('Service: elevationFactory', function () {

  // load the service's module
  beforeEach(module('pumprApp'));

  // instantiate service
  var elevationFactory;
  beforeEach(inject(function (_elevationFactory_) {
    elevationFactory = _elevationFactory_;
  }));

  it('should do something', function () {
    expect(!!elevationFactory).toBe(true);
  });

});
