'use strict';

describe('Directive: projectTable', function () {

  // load the directive's module and view
  beforeEach(module('pumprApp'));
  beforeEach(module('app/directives/projectTable/projectTable.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<project-table></project-table>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the projectTable directive');
  }));
});