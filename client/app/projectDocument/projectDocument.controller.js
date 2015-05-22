'use strict';

angular.module('pumprApp')
  .controller('ProjectDocumentCtrl', ['$scope', '$location', 'agsServer' , function ($scope, $location, agsServer) {
    $scope.documentid = $location.path().split('/')[3];
    $scope.documentInfo = $scope.documentid.split('-');
    $scope.projectname;
    var options = {
      layer: 'RPUD.PTK_DOCUMENTS',
      actions: 'query',
      params: {
        f: 'json',
        where: 'PROJECTID = ' + $scope.documentInfo[0] + " AND DOCTYPEID = '" + $scope.documentInfo[1] + "' AND DOCID = " + $scope.documentInfo[2],
        outFields: 'DOCID, WATER, SEWER, REUSE, STORM, PROJECTNAME, FORMERNAME, ALIAS, ENGID, DOCTYPEID, SHEETTYPEID',
        returnGeometry: false
      }
    };

    agsServer.ptFs.request(options)
      .then(function(res){
        if (res.error){

        }
        $scope.documentDetails = res.features[0];
        console.log(res)
      },
       function(err){

       });
  }]);
