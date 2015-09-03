'use strict';

describe('Service: facilityIdFactory', function () {

  // load the service's module
  beforeEach(module('pumprApp'));

  // instantiate service
  var elevationFactory;
  beforeEach(inject(function (_facilityIdFactory_) {
    facilityIdFactory = _facilityIdFactory_;
  }));

  it('should do something', function () {
    expect(!!facilityIdFactory).toBe(true);
  });

});
