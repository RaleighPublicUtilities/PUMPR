/**
 * AddDocument Controller
 * @namespace Controller
 * @desc Controls addDocument view
 */

(function(){
  'use strict';

  angular
    .module('pumprApp')
    .controller('AddDocumentCtrl', AddDocumentCtrl);

    AddDocumentCtrl.$inject = ['$scope', 'search', '$location'];

  function AddDocumentCtrl($scope, search, $location) {
      var self = this;

      self.path = $location.path();
      self.projectid = undefined;
      self.reload = reload;

      activate();

      function activate() {
        var options;
        if (self.path.split('/').length === 3){
          self.projectid = self.path.split('/')[2];
          options = {
            layer: 'RPUD.PTK_DOCUMENTS',
            actions: 'query',
            params: {
              f: 'json',
              where: 'PROJECTID = ' + self.projectid,
              outFields: '*',
              orderByFields: 'DOCID ASC',
              returnGeometry: false
            }
          };

          $scope.projectPromise = search.display(self.projectid)
            .then(prepareForm)
            .catch(function(error){
              $scope.projectError = true;
          });
        }
      }

      function prepareForm(data) {
        var project = data[0];
        data = data[1];
        //If no project documents have been added get project name from db
        if (!data.length){
          $scope.projectname = project.features[0].properties['Project Name'];
          //Prepare document to be added
          $scope.project = [{
            new: true,
            attributes: {
              PROJECTID: self.projectid,
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
        $scope.projectDocs = true;
      }

      function reload() {
        document.location.reload();
      }

    }

})();
