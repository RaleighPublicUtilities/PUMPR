'use strict';

describe('Service: agsServer', function () {

  // load the service's module
  beforeEach(module('pumprApp'));

  // instantiate service
  var agsServer;
  beforeEach(inject(function (_agsServer_) {
    agsServer.service = _agsServer_;
  }));

  it('should do something', function () {
    expect(!!agsServer).toBe(true);
  });

});
