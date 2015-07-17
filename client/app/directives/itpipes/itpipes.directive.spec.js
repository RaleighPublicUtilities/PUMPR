'use strict';

describe('Directive: itpipes', function () {

  // load the directive's module and view
  beforeEach(module('pumprApp'));
  beforeEach(module('app/directives/itpipes/itpipes.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<itpipes></itpipes>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the itpipes directive');
  }));
});