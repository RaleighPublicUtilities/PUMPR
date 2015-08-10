'use strict';

describe('Service: agsDomains', function () {

  // load the service's module
  beforeEach(module('pumprApp'));

  // instantiate service
  var agsDomains;
  beforeEach(inject(function (_agsDomains_) {
    agsDomains = _agsDomains_;
  }));

  it('should do something', function () {
    expect(!!agsDomains).toBe(true);
  });

});
