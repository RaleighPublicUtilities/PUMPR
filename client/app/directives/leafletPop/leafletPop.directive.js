'use strict';

angular.module('pumprApp')
  .directive('leafletPop', function () {
    return {
      templateUrl: 'app/directives/leafletPop/leafletPop.html',
      transclude: true,
      restrict: 'E',
      scope: {
        features: '='
      },
      link: function (scope, element, attrs) {
        scope.props = scope.$parent.features;
        scope.fg = scope.$parent.featuresGroup;
        console.log(scope.fg.toGeoJSON());
        
        scope.choice = scope.props['Project ID'] ? true : false;
        // scope.$watch('features', function(){
        //
        // });
      }
    };
  });
