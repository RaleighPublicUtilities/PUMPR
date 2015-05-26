'use strict';

describe('Service: projectSearch', function () {

  // load the service's module
  beforeEach(module('pumprApp'));

  // instantiate service
  var projectSearch;
  beforeEach(inject(function (_projectSearch_) {
    projectSearch = _projectSearch_;
  }));

  it('should return array', function () {
    var data;
    projectSearch.autoFill('Retrea')
      .then(function(res){
        data = res.features;
      });
    // expect(!!projectSearch).toBe(true);
    expect(data).toBeArrayOfObjects();
  });

});
