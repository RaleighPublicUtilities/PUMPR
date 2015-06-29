'use strict';

angular.module('pumprApp')
  .directive('projectTable', function () {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        project: '=',
        type: '@'
      },
      templateUrl: 'app/directives/projectTable/projectTable.html',
      link: function (scope) {
        //Gets correct REST endpoints form ArcGIS server

        var url;
        // scope.isDocument = true;
        scope.$watchCollection('project', function(){
          if (scope.project){
              if (scope.type === 'project'){
                url = 'http://devplansarchive.ci.raleigh.nc.us/documents/devplans/' + scope.project['Development Plan ID'];
                // console.log(scope.project)
                scope.project['Construction Plan Link'] = url;
              }

            }

        });


        scope.popup = function (url){
          var newwindow=window.open(url,'name','height=500,width=500');
          if (window.focus) {
            newwindow.focus();
          }
          return false;
        };

      }
    };
  });
