'use strict';

angular.module('pumprApp')
  .controller('MainCtrl', ['$scope','cookies', 'agsServer', 'projectSearch', '$rootScope', '$location', 'search',
    function ($scope, cookies, agsServer, projectSearch, $rootScope, $location, search) {
      //Set root scope as scope
      var scope = $rootScope;

      // $scope.project = {};

      $scope.autoFillProjects = function (typed) {
        //Turns on the map resulsts table
        $scope.searchStatus = false;
        $scope.projectDocs = false;
        $scope.projectError = false;
        //Uses the Project Search Servies
        $scope.projects = [];

        //Testing search factroy
         return search.all(typed)
          .then(function(res){
            var results = res[0].features.concat(res[1].features);

            if (results.length === 0){
              $scope.projects.push('Sorry Project Not Found...');
              return $scope.projects;
            }
            else{

                return results.map(function(item){
                  return item.attributes.PROJECTNAME + ':' + item.attributes.DEVPLANID + ':' + item.attributes.PROJECTID;
                });
            }

          })
          .catch(function(err){
            $scope.projectError = true;
          });

        //Adds the project to the recently searched cook
        scope.myrecent = $scope.projects;
      };
      //Function handles the selection
      $scope.searchControl = function (typed){
        if (typed === 'Sorry Project Not Found...'){
          return;
        }
        $location.url('/project/' + typed.split(':')[2]);
        //Add projects to recent projects cookie
        // cookies.addProjectCookie(typed)
      };


    }]);
