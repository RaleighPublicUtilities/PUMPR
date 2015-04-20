'use strict';

angular.module('pumprApp')
  .controller('MainCtrl', ['$scope','cookies', 'agsServer', 'projectSearch', '$rootScope',
    function ($scope, cookies, agsServer, projectSearch, $rootScope) {
      //Set root scope as scope
      var scope = $rootScope;

      $scope.project = {};

      $scope.autoFillProjects = function (typed) {
        //Turns on the map resulsts table
        $scope.searchStatus = false;
        $scope.project_docs = false;
        //Uses the Project Search Servies
        $scope.projects = [];
        var newProject = projectSearch.autoFill(typed);
        newProject.then(function(data){
              data.features = projectSearch.getSet(data.features);
              if (data.features.length === 0){
                $scope.projects.push('Sorry Project Not Found...');
              }
              for (var i = 0, x = data.features.length; i < x; i++){
                  if ($scope.projects.length < 5){
                    $scope.projects.push(data.features[i].attributes.PROJECTNAME + ':' + data.features[i].attributes.DEVPLANID + ':' + data.features[i].attributes.PROJECTID);
                  }
              }

          }, function (error){
            console.log(error);
        });
        //Adds the project to the recently searched cook
        scope.myrecent = $scope.projects;
      }
      //Function handles the selection
      $scope.searchControl = function (typed){
        if (typed === 'Sorry Project Not Found...'){
          return;
        }
        //Add projects to recent projects cookie
        cookies.addProjectCookie(typed);
        //Set up GET request options

        var options = {
          layer: 'RPUD.PTK_DOCUMENTS',
          actions: 'query',
          params: {
            f: 'json',
            where: 'PROJECTID = ' + typed.split(':')[2],
            outFields: '*',
            orderByFields: 'DOCID ASC',
            returnGeometry: false
          }
        };
        agsServer.ptFs.request(options).then(function(data){

          //If no project documents have been added
          if (!data.features.length){

            $scope.project = [{
              new: true,
              attributes: {
                PROJECTID: typed.split(':')[2],
                PROJECTNAME: typed.split(':')[0]
              }
            }];
          }
          //If project documents have been added
          else {
            $scope.project = data.features;
          }
          //Activates table view
          $scope.searchStatus = true;
          $scope.project_docs = true;
        });

      }
    }]);
