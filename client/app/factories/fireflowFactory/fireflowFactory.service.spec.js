'use strict';

describe('Service: fireflowFactory', function () {

  // load the service's module
  beforeEach(module('pumprApp'));

  // instantiate service
  var fireflowFactory;
  beforeEach(inject(function (_fireflowFactory_) {
    fireflowFactory = _fireflowFactory_;
  }));

  it('should do something', function () {
    expect(!!fireflowFactory).toBe(true);
  });

});
