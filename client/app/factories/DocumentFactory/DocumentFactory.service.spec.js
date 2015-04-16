'use strict';

describe('Service: DocumentFactory', function () {

  // load the service's module
  beforeEach(module('pumprApp'));

  // instantiate service
  var DocumentFactory;
  beforeEach(inject(function (_DocumentFactory_) {
    DocumentFactory = _DocumentFactory_;
  }));

  it('should do something', function () {
    expect(!!DocumentFactory).toBe(true);
  });

});
