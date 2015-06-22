'use strict';

angular.module('pumprApp')
  .directive('searchBar', ['$interval', '$location', 'search', function ($interval, $location, search) {
    return {
      templateUrl: 'app/directives/searchBar/searchBar.html',
      restrict: 'E',
      transclude: true,
      scope: {
        view: '@'
      },
      link: function (scope) {


        (function rotatePlaceholder (){
          var count = 0;
          var options = ['Search by Project Name...', 'Search by Project id...', 'Search by Development Plan Id...', 'Search by Address...', 'Search by Street...', 'Search by Facility Id'];
          $interval(function(){
            count = count > 4 ? 0 : count;
            scope.placeholder = options[count];
            count++;
          }, 3000);
        })();
        // rotatePlaceholder();
        scope.autoFillProjects = function (typed) {
          //Turns on the map resulsts table
          scope.searchStatus = false;
          scope.projectDocs = false;
          scope.projectError = false;
          //Uses the Project Search Servies
          scope.projects = [];

          //Testing search factroy
          scope.newProject = search.all(typed);
           return scope.newProject
            .then(function(res){
              console.log(res);
              var results = res[0].features.concat(res[1].features, res[2].features);

              if (results.length === 0){
                scope.projects.push('Sorry Project Not Found...');
                return scope.projects;
              }
              else{
                  return results.map(function(item){
                    return item.attributes.PROJECTNAME + ':' + item.attributes.DEVPLANID + ':' + item.attributes.PROJECTID;
                  });
              }

            })
            .catch(function(err){
              console.log(err);
              scope.projectError = true;
            });

          //Adds the project to the recently searched cook
          scope.myrecent = scope.projects;
        };
        //Function handles the selection
        scope.searchControl = function (typed){
          if (typed === 'Sorry Project Not Found...'){
            return;
          }
          console.log(scope.view);
          switch(scope.view){
            case 'main':
              $location.url('/project/' + typed.split(':')[2]);
            break;
            case 'addDoc':
              $location.path('/addDocument/' + typed.split(':')[2]);
            break;
            case 'addProj':

            break;
            default:
              $location.url('/project/' + typed.split(':')[2]);
          }
        };


      }
    };
  }]);