'use strict';

angular.module('pumprApp')
  .directive('itpipes', function (search) {
    return {
      templateUrl: 'app/directives/itpipes/itpipes.html',
      restrict: 'E',
      transclude: true,
      scope: {
        facid: '='
      },
      link: function (scope, element, attrs) {

        scope.$watch('facid', function(){
          if (scope.facid){
            search.itpipes(scope.facid).then(function(res){
              if (res.data.message){
                scope.message = res.data.message;
                scope.status = false;
              }
              else{
                scope.status = true;
                scope.vids = res.data.videos;
                scope.imgs = res.data.images;
              }

            })
            .catch(function(err){
              console.log(err);
            });
          }

        })

      }
    };
  });
