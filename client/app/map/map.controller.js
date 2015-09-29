(function () {
  'use strict';

    angular
      .module('pumprApp')
      .controller('MapCtrl', MapCtrl);

    MapCtrl.$inject = ['$scope','$location', 'Auth', 'mapLayers', 'leafletData', 'agsServer', '$compile'];

    function MapCtrl($scope, $location, Auth, mapLayers, leafletData, agsServer, $compile) {

      var self = this;

      self.agsToken = Auth.getAgolToken();
      self.searchObject = $location.search();
      self.center = {};
      self.markers = {};
      self.paths = {};
      self.searchStatus = false;
      self.selectedFeatures = new L.FeatureGroup(),
      self.selectedGeojson;

      activateMap();


      function activateMap() {

        //Dirty hack to make fullscreen map
        angular.element('body').find('div').addClass('fullScreen');

        mapLayers.overlays.water.visible = true;
        mapLayers.overlays.projects.visible = true;
        mapLayers.overlays.water.layerParams = {
          token: self.agsToken
        };
        mapLayers.overlays.sewer.visible = true;
        mapLayers.overlays.reuse.visible = true;

        switch (self.searchObject.group){
          case 'address':
            getMarker();
            break;
          case 'facilityid':
            if(self.searchObject.hasOwnProperty("location[x]")){
              getMarker();
            }
            else {
              getPath();
            }
            break;
          default:
            self.center = {
              lat: 35.77882840327371,
              lng: -78.63945007324219,
              zoom: 13
            };
          }

          //Set default map settings
          angular.extend($scope, {
            center: self.center,
            layers: mapLayers,
            events: {
              map: {
                enable: ['click'],
                logic: 'emit'
              }
            },
            markers: self.markers,
            paths: self.paths
          });

          leafletData.getMap('main-map')
            .then(function(map) {
              map.on('click', function(e){
                identifyFeature(map, e);
            });
          });
        }

        function getMarker() {
          //Set map center
          self.center = {
             lat: parseFloat(self.searchObject["location[y]"])|| 35.77882840327371,
             lng: parseFloat(self.searchObject["location[x]"]) || -78.63945007324219,
            zoom: 19
          };
          //Set marker position
          self.markers = {
            address: {
              lat: parseFloat(self.searchObject["location[y]"]),
              lng: parseFloat(self.searchObject["location[x]"]),
              label: {
                message: self.searchObject.name,
                options: {
                  noHide: true
                }
              }
            }
          };
        }

        function getPath() {
          self.center = {
            lat: parseFloat(self.searchObject["location[paths][0][0][]"][1])|| 35.77882840327371,
            lng: parseFloat(self.searchObject["location[paths][0][0][]"][0]) || -78.63945007324219,
            zoom: 19
          };

          self.paths = {
            path: {
              color: 'rgb(16, 230, 217)',
              weight: 8,
              latlngs: [
                {lat: parseFloat(self.searchObject["location[paths][0][0][]"][1]), lng: parseFloat(self.searchObject["location[paths][0][0][]"][0])},
                {lat: parseFloat(self.searchObject["location[paths][0][1][]"][1]), lng: parseFloat(self.searchObject["location[paths][0][1][]"][0])}
              ],
              message: '<h3>' + self.searchObject.name + '</h3>',
            }
          };
        }

        function createPopup(feature, layer) {
          var el = document.createElement('leaflet-pop'),
              linkFunction = $compile(angular.element(el)),
              newScope = $scope.$new();
              newScope.features = feature.properties;
              newScope.featuresGroup = self.selectedFeatures;

          layer.bindPopup(linkFunction(newScope)[0], {
            maxHeight: 300
          });
        }

        function identifyFeature(map, e) {
          var selectionStyle, size, imgSize, onClickOptions;

          selectionStyle = {
            fill: true,
            weight: 5,
            opacity: 1,
            color: 'rgba(12, 235, 255, 0.71)',
            dashArray: '4'
          };

          size = map.getSize();
          imgSize = [size.x, size.y, 96].join();
          self.selectedFeatures.clearLayers();

          map.eachLayer(function(layer){

          if (layer.options !== undefined && layer.options.layers) {
            onClickOptions = {
              params: {
                f: 'json',
                geometry: {x: e.latlng.lng, y: e.latlng.lat},
                mapExtent: [e.latlng.lng, e.latlng.lat, e.latlng.lng + 0.01, e.latlng.lat + 0.01].toString(),
                tolerance: 5,
                imageDisplay: imgSize,
                layers: layer.options.layers.toString(),
                sr: 4326
              },
              actions: 'identify',
              geojson: true
            };
            switch (layer.options.url){
              case 'http://mapststarcsvr1:6080/arcgis/rest/services/PublicUtility/ProjectTracking/MapServer/':
                agsServer.ptMs.request(onClickOptions)
                .then(function(data){
                  self.selectedGeojson = L.geoJson(data, {
                    onEachFeature: createPopup,
                    style: selectionStyle
                  });
                  self.selectedFeatures.addLayer(self.selectedGeojson);
                });
                break;
              case 'http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/ReclaimedDistribution/MapServer/':
                agsServer.reclaimedMs.request(onClickOptions)
                .then(function(data){
                  self.selectedGeojson = L.geoJson(data, {
                    onEachFeature: createPopup,
                    style: selectionStyle
                  });
                  self.selectedFeatures.addLayer(self.selectedGeojson);
                });
                break;
              case 'http://maps.raleighnc.gov/arcgis/rest/services/PublicUtility/WaterDistribution/MapServer/':
                agsServer.waterMs.request(onClickOptions)
                .then(function(data){
                  self.selectedGeojson = L.geoJson(data, {
                    onEachFeature: createPopup,
                    style: selectionStyle
                  });
                  self.selectedFeatures.addLayer(self.selectedGeojson);
                });
                break;
              case 'http://maps.raleighnc.gov/arcgis/rest/services/PublicUtility/SewerExternal/MapServer/':
                agsServer.sewerMs.request(onClickOptions)
                  .then(function(data){
                    self.selectedGeojson = L.geoJson(data, {
                      onEachFeature: createPopup,
                      style: selectionStyle
                    });
                    self.selectedFeatures.addLayer(self.selectedGeojson);
                  });
                break;
              case 'http://maps.raleighnc.gov/arcgis/rest/services/Parcels/MapServer/':
                agsServer.parcelsMs.request(onClickOptions)
                .then(function(data){
                  self.selectedGeojson = L.geoJson(data, {
                    onEachFeature: createPopup,
                    style: selectionStyle
                  });
                  self.selectedFeatures.addLayer(self.selectedGeojson);
                });
                break;
              case 'http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/RPUD_Projects/MapServer/':
                  agsServer.cip.request(onClickOptions)
                  .then(function(data){
                    self.selectedGeojson = L.geoJson(data, {
                      onEachFeature: createPopup,
                      style: selectionStyle
                    });
                    self.selectedFeatures.addLayer(self.selectedGeojson);
                  });
                  break;
              case 'http://geodevapplv1:6080/arcgis/rest/services/Networkfleet/MapServer/':
                agsServer.vechMs.request(onClickOptions)
                .then(function(data){
                  self.selectedGeojson = L.geoJson(data, {
                    onEachFeature: createPopup,
                    style: selectionStyle
                  });
                  self.selectedFeatures.addLayer(self.selectedGeojson);
                })
                .catch(function(err){
                  console.error(err);
                });
                break;
              default:
                return;
            }

            self.selectedFeatures.addTo(map);
            self.selectedFeatures.bringToFront();
          }
        });
      }

    }
})();
