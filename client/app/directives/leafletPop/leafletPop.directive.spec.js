'use strict';

describe('Directive: leafletPop', function () {

  // load the directive's module and view
  beforeEach(module('pumprApp'));
  beforeEach(module('app/directives/leafletPop/leafletPop.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<leaflet-pop></leaflet-pop>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the leafletPop directive');
  }));
});