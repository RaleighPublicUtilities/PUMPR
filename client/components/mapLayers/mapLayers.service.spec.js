'use strict';

describe('Service: mapControls', function () {

  // load the service's module
  beforeEach(module('pumprApp'));

  // instantiate service
  var mapControls;
  beforeEach(inject(function (_mapControls_) {
    mapControls = _mapControls_;
  }));

  it('should do something', function () {
    expect(!!mapControls).toBe(true);
  });

});
