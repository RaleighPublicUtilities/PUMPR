(function(){
  'use strict';

  angular
    .module('pumprApp')
    .controller('FireflowCtrl', FireflowCtrl);

    FireflowCtrl.$inject = ['$scope', 'Auth', 'mapLayers', 'leafletData', 'fireflowFactory', 'icon'];

  function FireflowCtrl($scope, Auth, mapLayers, leafletData, fireflowFactory, icon) {
    var vm = this;
    $scope.agsToken = Auth.getAgolToken();
    $scope.searchStatus = false;
    mapLayers.overlays.water.visible = true;
    mapLayers.overlays.water.layerParams = {
        token: $scope.agsToken
    },
    mapLayers.overlays.sewer.visible = false;
    mapLayers.overlays.reuse.visible = false;

    //Sets form status to false
    $scope.formStatus = fireflowFactory.getFormStatus;

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
      markers: fireflowFactory.getLog()
    });
    activate();

    function activate() {
      angular.element('body').find('div').addClass('fullScreen');
      return leafletData.getMap('fireflow-map').then(function(map) {
        map.locate({setView: true, maxZoom: 17});
      });
    }


    $scope.$on('leafletDirectiveMap.click', function(event, args){
      $scope.eventDetected = event.name;
      // console.log(args.leafletEvent);
      var latlng = args.leafletEvent.latlng;
      $scope.flowPromise = fireflowFactory.find(latlng)
        .then(function(res){
          if (Array.isArray(res.features) && res.features.length === 1){
            var geom = res.features[0].geometry.coordinates;
            var marker = {
              lat: geom[1],
              lng: geom[0],
              focus: true,
              lable: {
                options: {
                  noHide: true
                }
              },
              properties: res.features[0].properties
            };

            switch ($scope.markers.length){
              case 0:
                marker.message = 'Test: ' + res.features[0].properties['Facility Identifier'];
                marker.icon = icon.test;
                break;
              case 1:
                marker.message = 'Flow: ' + res.features[0].properties['Facility Identifier'];
                marker.icon = icon.flow;
                break;
              default:
                return;
            }
             //Add Markers
             fireflowFactory.addLog(marker);
          }
        })
        .catch(function(err){
          console.error(err);
        });
    });


  }
})();
