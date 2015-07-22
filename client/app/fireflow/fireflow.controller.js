'use strict';

angular.module('pumprApp')
  .controller('FireflowCtrl', function ($scope, Auth, mapLayers, leafletData, fireflowFactory) {
    //Make map height 100%
    angular.element('body').find('div').addClass('fullScreen');

    //Get token from ArcGIS Server
    $scope.agsToken = Auth.getAgolToken();
    $scope.searchStatus = false;
    mapLayers.overlays.water.visible = true;
    mapLayers.overlays.water.layerParams = {
        token: $scope.agsToken
    },
    mapLayers.overlays.sewer.visible = false;
    mapLayers.overlays.reuse.visible = false;

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
          enable: ['click', 'drag', 'blur', 'touchstart'],
          logic: 'emit'
        }
      }
    });

    //Get GeoIP
    leafletData.getMap('fireflow-map').then(function(map) {
      map.locate({setView: true, maxZoom: 17});
    });


    $scope.$on('leafletDirectiveMap.click', function(event, args){
      $scope.eventDetected = event.name;
      console.log(event);
      console.log(args.leafletEvent);
      var latlng = args.leafletEvent.latlng;
      fireflowFactory.find(latlng)
        .then(function(res){
          console.log(res);
        })
        .catch(function(err){
          console.log(err);
        });
    });


  });//End Controller
