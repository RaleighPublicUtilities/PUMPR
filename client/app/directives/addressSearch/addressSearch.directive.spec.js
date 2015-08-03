'use strict';

describe('Directive: addressSearch', function () {

  // load the directive's module and view
  beforeEach(module('pumprApp'));
  beforeEach(module('app/directives/addressSearch/addressSearch.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<address-search></address-search>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the addressSearch directive');
  }));
});