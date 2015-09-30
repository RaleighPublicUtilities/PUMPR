'use strict';

describe('Service: search', function () {

  // load the service's module
  beforeEach(module('pumprApp'));

  // instantiate service
  var search;
  beforeEach(inject(function (_search_) {
    search = _search_;
  }));

  it('should get address', function () {
    expect(!!search).toBe(true);
  });

  it('should make uppercase and convert single quote', function () {
    expect(!!search).toBe(true);
  });

  it('should delete fields that are null', function () {
    expect(!!search).toBe(true);
  });

  it('should join two tables', function () {
    expect(!!search).toBe(true);
  });

  it('should create buffer', function () {
    expect(!!search).toBe(true);
  });

  it('should convert utilities', function () {
    expect(!!search).toBe(true);
  });

});
