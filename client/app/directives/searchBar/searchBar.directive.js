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
          var count = 0,
              options = ['Search by Project Name...', 'Search by Project id...', 'Search by Development Plan Id...', 'Search by Address...', 'Search by Street...', 'Search by Facility Id'];
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

              if (Array.isArray(res)){
                  var filtered = _.flatten(res);

              }

              if (Array.isArray(filtered) && res.length === 0){
                scope.projects.push('Sorry Project Not Found...');
                return scope.projects;
              }
              else{

                  var unique = _.uniq(filtered);

                  var results = _(unique)
                          .groupBy('group')
                          .map(function (g) {
                            g[0].firstInGroup = true;  // the first item in each group
                            return g;
                          })
                          .flatten()
                          .value();



                        return results;
              }

            })
            .catch(function(err){
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
          console.log(typed);
          switch(scope.view){
            case 'main':
              if (typed.group === 'project'){
                $location.url('/project/' + typed.name.split(':')[2]);
              }
              else if (typed.group === 'address'){
                // $location.path('/map/' + typed.location.x + '/' + typed.location.y);
                  var path =  '/map?' + $.param(typed);
                  location = path;
              }
              else if (typed.group === 'facilityid'){
                var path =  '/map?' + $.param(typed);
                location = path;
              }
            break;
            case 'addDoc':
              $location.path('/addDocument/' + typed.name.split(':')[2]);
            break;
            case 'map':


            break;
            default:
              $location.url('/project/' + typed.name.split(':')[2]);
          }
        };


      }
    };
  }]);
