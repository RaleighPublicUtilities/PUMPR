'use strict';

describe('Service: arcgisTokenFactory', function () {

  // load the service's module
  beforeEach(module('pumprApp'));

  // instantiate service
  var arcgisTokenFactory;
  beforeEach(inject(function (_arcgisTokenFactory_) {
    arcgisTokenFactory = _arcgisTokenFactory_;
  }));

  it('should do something', function () {
    expect(!!arcgisTokenFactory).toBe(true);
  });

});
