'use strict';

describe('Directive: documentForm', function () {

  // load the directive's module and view
  beforeEach(module('pumprApp'));
  beforeEach(module('app/directives/documentForm/documentForm.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<document-form></document-form>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the documentForm directive');
  }));
});