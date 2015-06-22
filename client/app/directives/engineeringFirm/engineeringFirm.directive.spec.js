'use strict';

describe('Directive: engineeringFirm', function () {

  // load the directive's module and view
  beforeEach(module('pumprApp'));
  beforeEach(module('app/directives/engineeringFirm/engineeringFirm.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<engineering-firm></engineering-firm>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the engineeringFirm directive');
  }));
});