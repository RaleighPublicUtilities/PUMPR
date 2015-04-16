'use strict';

describe('Service: projectSearch', function () {

  // load the service's module
  beforeEach(module('pumprApp'));

  // instantiate service
  var projectSearch;
  beforeEach(inject(function (_projectSearch_) {
    projectSearch = _projectSearch_;
  }));

  it('should do something', function () {
    expect(!!projectSearch).toBe(true);
  });

});
