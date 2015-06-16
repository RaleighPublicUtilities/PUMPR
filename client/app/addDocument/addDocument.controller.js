'use strict';

angular.module('pumprApp')
  .controller('AddDocumentCtrl', ['$scope','$interval', 'agsServer', 'projectSearch', 'search', '$location',
    function ($scope, $interval, agsServer, projectSearch, search, $location) {
      //Set root scope as scope

      var path = $location.path();
      $scope.project = {};
      $scope.projectname;

      $scope.reload = function(){
        document.location.reload();
      }

//Checks if project is in path and set view to project
      if (path.split('/').length === 3){
        var projectid = path.split('/')[2];
        var options = {
          layer: 'RPUD.PTK_DOCUMENTS',
          actions: 'query',
          params: {
            f: 'json',
            where: 'PROJECTID = ' + projectid,
            outFields: '*',
            orderByFields: 'DOCID ASC',
            returnGeometry: false
          }
        };


        $scope.projectPromise = search.display(projectid).then(function(data){
          var project = data[0];

          data = data[1];

          //If no project documents have been added get project name from db
          if (!data.length){
              $scope.projectname = project.features[0].properties['Project Name'];
            //Prepare document to be added
            $scope.project = [{
              new: true,
              attributes: {
                PROJECTID: projectid,
                PROJECTNAME: project.features[0].properties['Project Name'],
                DEVPLANID: project.features[0].properties['Development Plan ID']
              }
            }];

          }
          //If project documents have been added
          else {
            $scope.projectname = project.features[0].properties['Project Name'];
            $scope.project = data;
          }
          //Activates table view
          $scope.searchStatus = true;
          $scope.project_docs = true;
        })
        .catch(function(error){
          $scope.projectError = true;
        });

      }



      function rotatePlaceholder (){
        var count = 0;
        var options = ['Search by Project Name...', 'Search by Project id...', 'Search by Development Plan Id...', 'Search by Address...', 'Search by Street...', 'Search by Facility Id' ];
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
            var results = res[0].features.concat(res[1].features, res[2].features);

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

      };

      //Function handles the selection
      $scope.searchControl = function (typed){
        $location.path('/addDocument/' + typed.split(':')[2]);

      };
    }]);
