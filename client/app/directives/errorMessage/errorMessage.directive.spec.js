'use strict';

describe('Directive: errorMessage', function () {

  // load the directive's module and view
  beforeEach(module('pumprApp'));
  beforeEach(module('app/directives/errorMessage/errorMessage.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<error-message></error-message>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the errorMessage directive');
  }));
});