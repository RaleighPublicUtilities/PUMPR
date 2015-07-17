'use strict';

angular.module('pumprApp')
  .directive('itpipes', function ('search') {
    return {
      templateUrl: 'app/directives/itpipes/itpipes.html',
      restrict: 'E',
      transclude: true,
      scope: {
        facid: '='
      },
      link: function (scope, element, attrs) {
        search.itpipes('SGMN166276').then(function(data){
          console.log(data);
        });
      }
    };
  });
