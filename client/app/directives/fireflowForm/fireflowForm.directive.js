'use strict';

angular.module('pumprApp')
  .directive('fireflowForm', function (fireflowFactory) {
    return {
      templateUrl: 'app/directives/fireflowForm/fireflowForm.html',
      transclude: true,
      restrict: 'E',
      scope: {
        flowData: '='
      },
      link: function (scope) {

        fireflowFactory.getForm().then(function(res){
            console.log(res);
          })
          .catch(function(err){
            console.log(err);
          });

      }
    };
  });
