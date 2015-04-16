'use strict';

describe('Service: streetSearch', function () {

  // load the service's module
  beforeEach(module('pumprApp'));

  // instantiate service
  var streetSearch;
  beforeEach(inject(function (_streetSearch_) {
    streetSearch = _streetSearch_;
  }));

  it('should do something', function () {
    expect(!!streetSearch).toBe(true);
  });

});
