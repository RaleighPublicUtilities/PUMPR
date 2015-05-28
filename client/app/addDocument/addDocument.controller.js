'use strict';

angular.module('pumprApp')
  .controller('AddDocumentCtrl', ['$scope','cookies', 'agsServer', 'projectSearch', '$rootScope', '$location',
    function ($scope, cookies, agsServer, projectSearch, $rootScope, $location) {
      //Set root scope as scope
      var scope = $rootScope;
      var path = $location.path();
      $scope.project = {};
      $scope.projectname;

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

        agsServer.ptFs.request(options).then(function(data){

          //If no project documents have been added get project name from db
          if (!data.features.length){
            options.layer = 'Project Tracking';
            options.params.outFields = 'PROJECTNAME';
            delete options.params.orderByFields;
            agsServer.ptFs.request(options).then(function(data){
              $scope.projectname = data.features[0].attributes.PROJECTNAME;
            //Prepare document to be added
            $scope.project = [{
              new: true,
              attributes: {
                PROJECTID: projectid,
                PROJECTNAME: data.features[0].attributes.PROJECTNAME
              }
            }];
          });
          }
          //If project documents have been added
          else {
            $scope.projectname = data.features[0].attributes.PROJECTNAME;
            $scope.project = data.features;
          }
          //Activates table view
          $scope.searchStatus = true;
          $scope.project_docs = true;
        });

      }



//Waits for input from user and switches to selected view
      $scope.autoFillProjects = function (typed) {
        //Turns on the map resulsts table
        $scope.searchStatus = false;
        $scope.project_docs = false;
        $scope.projectError = false;
        //Uses the Project Search Servies
        $scope.projects = [];
        $scope.newProject = projectSearch.autoFill(typed)
          .then(function(data){
              console.log(data);
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
            $scope.projectError = true;
        });
        //Adds the project to the recently searched cook
        scope.myrecent = $scope.projects;
      };
      //Function handles the selection
      $scope.searchControl = function (typed){
        $location.path('/addDocument/' + typed.split(':')[2]);
        // if (typed === 'Sorry Project Not Found...'){
        //   return;
        // }
        // //Add projects to recent projects cookie
        // cookies.addProjectCookie(typed);
        // //Set up GET request options
        //
        // var options = {
        //   layer: 'RPUD.PTK_DOCUMENTS',
        //   actions: 'query',
        //   params: {
        //     f: 'json',
        //     where: 'PROJECTID = ' + typed.split(':')[2],
        //     outFields: '*',
        //     orderByFields: 'DOCID ASC',
        //     returnGeometry: false
        //   }
        // };
        // agsServer.ptFs.request(options).then(function(data){
        //
        //   //If no project documents have been added
        //   if (!data.features.length){
        //
        //     $scope.project = [{
        //       new: true,
        //       attributes: {
        //         PROJECTID: typed.split(':')[2],
        //         PROJECTNAME: typed.split(':')[0]
        //       }
        //     }];
        //   }
        //   //If project documents have been added
        //   else {
        //     $scope.project = data.features;
        //   }
        //   //Activates table view
        //   $scope.searchStatus = true;
        //   $scope.project_docs = true;
        //   $location.path('/addDocument/' + typed.split(':')[2]);
        // });

      };
    }]);
