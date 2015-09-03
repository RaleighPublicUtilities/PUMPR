'use strict';

angular.module('pumprApp')
  .controller('MapCtrl', function ($scope, Auth, mapLayers, leafletData) {
    //Make map height 100%
    angular.element('body').find('div').addClass('fullScreen');
    //Get token from ArcGIS Server
    $scope.agsToken = Auth.getAgolToken();
    $scope.searchStatus = false;
    mapLayers.overlays.water.visible = true;
    mapLayers.overlays.water.layerParams = {
        token: $scope.agsToken
    },
    mapLayers.overlays.sewer.visible = true;
    mapLayers.overlays.reuse.visible = true;

    //Set default map settings
    angular.extend($scope, {
      center: {
        lat: 35.77882840327371,
        lng: -78.63945007324219,
        zoom: 13
      },
      layers: mapLayers,
      events: {
        map: {
          enable: ['click'],
          logic: 'emit'
        }
      },
      // markers: fireflowFactory.getLog()
    });

  });
