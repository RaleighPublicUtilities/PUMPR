'use strict';

describe('Service: icon', function () {

  // load the service's module
  beforeEach(module('pumprApp'));

  // instantiate service
  var icon;
  beforeEach(inject(function (_icon_) {
    icon = _icon_;
  }));

  it('should do something', function () {
    expect(!!icon).toBe(true);
  });

});
