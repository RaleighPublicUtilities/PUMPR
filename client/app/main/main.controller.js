'use strict';

angular.module('pumprApp')
  .controller('MainCtrl', ['$scope', 'agsServer', 'projectSearch', '$location', 'search', '$interval',
    function ($scope, agsServer, projectSearch, $location, search, $interval) {


      function rotatePlaceholder (){
        var count = 0;
        var options = ['Search by Project Name...', 'Search by Project id...', 'Search by Development Plan Id...', 'Search by Address...', 'Search by Street...' ];
        $interval(function(){
          count = count > 4 ? 0 : count;
          $scope.placeholder = options[count];
          count++;
        }, 3000);
      }
      rotatePlaceholder();
      $scope.autoFillProjects = function (typed) {
        //Turns on the map resulsts table
        $scope.searchStatus = false;
        $scope.projectDocs = false;
        $scope.projectError = false;
        //Uses the Project Search Servies
        $scope.projects = [];

        //Testing search factroy
        $scope.newProject = search.all(typed);
         return $scope.newProject
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

      };


    }]);
