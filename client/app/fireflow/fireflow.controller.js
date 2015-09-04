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

    var icons = {
       test: {
         iconUrl: 'assets/images/testHydrant.png',
         iconSize:     [20, 30], // size of the icon
         iconAnchor:   [10, 25], // point of the icon which will correspond to marker's location
       },
       flow: {
         iconUrl: 'assets/images/flowHydrant.png',
         iconSize:     [20, 30], // size of the icon
         iconAnchor:   [10, 25], // point of the icon which will correspond to marker's location
       }
    };


    leafletData.getMap('fireflow-map').then(function(map) {
      //Get GeoIP
      map.locate({setView: true, maxZoom: 17});


      //Add Custom controls
      var flowControl = L.Control.extend({
        options: {
          position: 'bottomleft'
        },

        onAdd: function (map) {
          this._container = L.DomUtil.get('flowControl');
          // Disable dragging when user's cursor enters the element
          this._container.addEventListener('mouseover', function () {
              map.dragging.disable();
          });

          // Re-enable dragging when user's cursor leaves the element
          this._container.addEventListener('mouseout', function () {
              map.dragging.enable();
          });
            return this._container;
        }
      });

      map.addControl(new flowControl());

      //Adds search bar to map
        var searchBar = L.Control.extend({
          options: {
            position: 'topleftish'
          },

          onAdd: function (map) {
            var $controlContainer = map._controlContainer,
                nodes = $controlContainer.childNodes,
                topleftish = false;

            for (var i = 0, len = nodes.length; i < len; i++) {
                var klass = nodes[i].className;
                if (/leaflet-top/.test(klass) && /leaflet-leftish/.test(klass)) {
                  topleftish = true;
                    break;
                }
            }
            if (!topleftish) {
                var tc = document.createElement('div');
                tc.className += 'leaflet-top leaflet-leftish';
                $controlContainer.appendChild(tc);
                map._controlCorners.topleftish = tc;
            }
            this._map = map;
            this._container = L.DomUtil.get('searchBar');
              return this._container;
          }
      });

      map.addControl(new searchBar());
    });




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
             fireflowFactory.addLog(marker);
          }
        })
        .catch(function(err){
          console.log(err);
        });
    });


  });//End Controller
