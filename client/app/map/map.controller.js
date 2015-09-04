'use strict';

angular.module('pumprApp')
  .controller('MapCtrl', function ($scope, $location, Auth, mapLayers, leafletData) {
    var center, markers = {};
    var searchObject = $location.search();
    console.log(searchObject)
    switch (searchObject.group){
      case 'address':
        center = {
           lat: parseFloat(searchObject["location[y]"])|| 35.77882840327371,
           lng: parseFloat(searchObject["location[x]"]) || -78.63945007324219,
          zoom: 19
        };
        markers = {
          address: {
            lat: parseFloat(searchObject["location[y]"]),
            lng: parseFloat(searchObject["location[x]"]),
            label: {
              message: searchObject.name,
              options: {
                noHide: true
              }
            }
          }
       }
        break;
      case 'facilityid':
        break;
      default:

    }
    // var path = $location.path().split('/');
    // var center = {
    //   lat: parseFloat(path[3]) || 35.77882840327371,
    //   lng: parseFloat(path[2]) || -78.63945007324219,
    //   zoom: 19
    // };
    // if(path.length === 4){
    //    markers = {
    //      address: {
    //        lat: parseFloat(path[3]),
    //        lng: parseFloat(path[2])
    //      }
    //   }
    // }
    // else {
    //   markers = {};
    //   center.zoom = 13;
    // }

    //Make map height 100%
    angular.element('body').find('div').addClass('fullScreen');
    //Get token from ArcGIS Server
    $scope.agsToken = Auth.getAgolToken();
    $scope.searchStatus = false;
    mapLayers.overlays.water.visible = true;
    mapLayers.overlays.projects.visible = true;
    mapLayers.overlays.water.layerParams = {
        token: $scope.agsToken
    },
    mapLayers.overlays.sewer.visible = true;
    mapLayers.overlays.reuse.visible = true;

    //Set default map settings
    angular.extend($scope, {
      center: center,
      layers: mapLayers,
      events: {
        map: {
          enable: ['click'],
          logic: 'emit'
        }
      },
      markers: markers
    });

  });
