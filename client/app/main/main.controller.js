'use strict';

angular.module('pumprApp')
  .controller('MainCtrl', ['$scope','cookies', 'agsServer', 'projectSearch', '$rootScope', '$location', 'search',
    function ($scope, cookies, agsServer, projectSearch, $rootScope, $location, search) {
      //Set root scope as scope
      var scope = $rootScope;

      $scope.project = {};

      $scope.autoFillProjects = function (typed) {
        //Turns on the map resulsts table
        $scope.searchStatus = false;
        $scope.projectDocs = false;
        $scope.projectError = false;
        //Uses the Project Search Servies
        $scope.projects = [];
        $scope.newProject = projectSearch.autoFill(typed);
        $scope.newProject.then(function(data){
              data.features = projectSearch.getSet(data.features);
              if (data.features.length === 0){
                $scope.projects.push('Sorry Project Not Found...');
              }
              for (var i = 0, x = data.features.length; i < x; i++){
                  if ($scope.projects.length < 5){
                    $scope.projects.push(data.features[i].attributes.PROJECTNAME + ':' + data.features[i].attributes.DEVPLANID + ':' + data.features[i].attributes.PROJECTID);
                  }
              }

          }, function (err){
            $scope.projectError = true;

        });

        //Testing search factroy
        search.addresses(typed)
          .then(function(res){
            console.log(res);
          })
          .catch(function(err){
            console.error(err);
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
        // cookies.addProjectCookie(typed);


      };
    }]);
