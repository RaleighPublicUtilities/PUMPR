'use strict';

angular.module('pumprApp')
  .controller('ProjectCtrl', ['$scope', '$location', 'agsServer', function ($scope, $location, agsServer) {
    // //Set up GET request options
    //
    $scope.projectid = $location.path().split('/')[2]
    console.log($scope.projectid)
    var options = {
      layer: 'RPUD.PTK_DOCUMENTS',
      actions: 'query',
      params: {
        f: 'json',
        where: 'PROJECTID = ' + $scope.projectid,
        outFields: '*',
        orderByFields: 'DOCID ASC',
        returnGeometry: false
      }
    };

    agsServer.ptFs.request(options).then(function(data){
      if (data.error || (Array.isArray(data.features) && data.features.length === 0)){
        $scope.message = {
          docs: false,
          error: "No Documents are currently loaded."
        }
      }
      else {
        $scope.docs = data;
      }

    }, function(err){
      console.log(err)
    });
  }]);
