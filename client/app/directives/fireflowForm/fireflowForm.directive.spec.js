'use strict';

describe('Directive: fireflowForm', function () {

  // load the directive's module and view
  beforeEach(module('pumprApp'));
  beforeEach(module('app/directives/fireflowForm/fireflowForm.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<fireflow-form></fireflow-form>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the fireflowForm directive');
  }));
});