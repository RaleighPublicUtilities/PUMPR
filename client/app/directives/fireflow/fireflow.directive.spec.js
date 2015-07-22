'use strict';

describe('Directive: fireflow', function () {

  // load the directive's module and view
  beforeEach(module('pumprApp'));
  beforeEach(module('app/directives/fireflow/fireflow.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<fireflow></fireflow>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the fireflow directive');
  }));
});