'use strict';

angular.module('pumprApp')
  .directive('projectTable', function () {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        project: '='
      },
      templateUrl: 'app/directives/projectTable/projectTable.html',
      link: function (scope) {
        //Gets correct REST endpoints form ArcGIS server
        var url;
        scope.$watchCollection('project', function(){
          if (scope.project){
            url = 'http://devplansarchive.ci.raleigh.nc.us/documents/devplans/' + scope.project.DEVPLANID;
            // var ele = angular.element('<a href="'+ url + '">Link</a>');
            scope.project.CPLINK = url;

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
