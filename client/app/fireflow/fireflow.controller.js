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
      },
      markers: []
    });

    var icons = {
       test: {
         iconUrl: 'assets/images/testHydrant.png',
         iconSize:     [20, 30], // size of the icon
         iconAnchor:   [10, 25], // point of the icon which will correspond to marker's location
        //  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
       },
       flow: {
         iconUrl: 'assets/images/flowHydrant.png',
         iconSize:     [20, 30], // size of the icon
         iconAnchor:   [10, 25], // point of the icon which will correspond to marker's location
        //  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
       }
    };

    //Get GeoIP
    leafletData.getMap('fireflow-map').then(function(map) {
      map.locate({setView: true, maxZoom: 17});
    });


    $scope.$on('leafletDirectiveMap.click', function(event, args){
      $scope.eventDetected = event.name;
      // console.log(args.leafletEvent);
      var latlng = args.leafletEvent.latlng;
      fireflowFactory.find(latlng)
        .then(function(res){
          console.log(res);
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
              }
            };
            
            switch ($scope.markers.length){
              case 0:
                marker.message = 'Test: ' + res.features[0].properties['Facility Identifier'];
                marker.icon = icons.test;
                break;
              case 1:
                marker.message = 'Flow: ' + res.features[0].properties['Facility Identifier'];
                marker.icon = icons.flow;
                break;
              default:
                return;
            }
             //Add Markers
            $scope.markers.push(marker);
          }
          console.log($scope.markers)
        })
        .catch(function(err){
          console.log(err);
        });
    });


  });//End Controller
