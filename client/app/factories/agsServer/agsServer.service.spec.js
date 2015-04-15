'use strict';

describe('Service: agsServer.service', function () {

  // load the service's module
  beforeEach(module('pumprApp'));

  // instantiate service
  var agsServer.service;
  beforeEach(inject(function (_agsServer.factory.js_) {
    agsServer.service = _agsServer.service_;
  }));

  it('should do something', function () {
    expect(!!agsServer.service).toBe(true);
  });

});
