'use strict';

angular.module('pumprApp')
  .controller('AddDocumentCtrl', ['$scope', 'search', '$location',
    function ($scope, search, $location) {
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



    }]);
