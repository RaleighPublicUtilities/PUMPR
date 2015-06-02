'use strict';

describe('Service: addEngineeringFirm', function () {

  // load the service's module
  beforeEach(module('pumprApp'));

  // instantiate service
  var addEngineeringFirm;
  beforeEach(inject(function (_addEngineeringFirm_) {
    addEngineeringFirm = _addEngineeringFirm_;
  }));

  it('should do something', function () {
    expect(!!addEngineeringFirm).toBe(true);
  });

});
