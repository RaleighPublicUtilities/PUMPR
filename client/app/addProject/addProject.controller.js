'use strict';

angular.module('pumprApp')
  .controller('AddProjectCtrl', ['$scope', '$rootScope', '$http', '$filter', '$sce', 'leafletData', 'projectSearch', 'cookies', 'agsServer',
    function ($scope, $rootScope, $http, $filter, $sce, leafletData, projectSearch, cookies, agsServer) {

    //Add root scope to set recent projects
    var scope = $rootScope;
    //Make map height 100%
    angular.element('body').find('div').addClass('fullScreen');
  $scope.searchStatus = false;
  //create a map in the "map" div, set the view to a given place and zoom
  angular.extend($scope, {
      center: {
        lat: 35.77882840327371,
        lng: -78.63945007324219,
        zoom: 13
      },
      layers: {
            baselayers: {
                xyz: {
                  name: 'Death Star',
                  url: 'https://{s}.tiles.mapbox.com/v3/examples.3hqcl3di/{z}/{x}/{y}.png',
                  type: 'xyz'
                },
                osm: {
                  name: 'Open Street Map',
                  url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                  type: 'xyz'
                },
                raleigh:{

                  name: 'Basic Base Map',
                    type: 'dynamic',
                    url: 'http://maps.raleighnc.gov/arcgis/rest/services/BaseMap/MapServer',
                    visible: false,
                    layerOptions: {
                        layers: ['*'],
                          opacity: 0.5,
                          attribution: 'Copyright:© 2014 City of Raleigh'
                    }
                }
            },
            overlays: {
              projects:{
              name: 'Project Tracking',
                type: 'dynamic',
                url: 'http://mapststarcsvr1:6080/arcgis/rest/services/PublicUtility/ProjectTracking/MapServer',
                visible: false,
                layerOptions: {
                    layers: [1],
                      opacity: 0.5,
                      attribution: 'Copyright:© 2014 City of Raleigh',
                      position: 'back'
                },
              },
                sewer: {
                name: 'Sewer Collection Network',
                  type: 'dynamic',
                  url: 'http://maps.raleighnc.gov/arcgis/rest/services/PublicUtility/SewerExternal/MapServer',
                  visible: false,
                  layerOptions: {
                      layers: [0,1,2,3,4],
                        opacity: 1,
                        attribution: 'Copyright:© 2014 City of Raleigh',
                        position: 'back'
                  }
            },
            water: {
              name: 'Water Distribution Network',
                type: 'dynamic',
                url: 'http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/WaterDistribution/MapServer',
                visible: false,
                layerOptions: {
                    layers: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
                      opacity: 1,
                      attribution: 'Copyright:© 2014 City of Raleigh',
                      position: 'back'
                }
            },
            reuse: {
              name: 'Reuse Distribution Network',
                type: 'dynamic',
                url: 'http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/ReclaimedDistribution/MapServer',
                visible: false,
                layerOptions: {
                    layers: [0,1,2,3,4,5,6,7,8,9,10,11],
                      opacity: 1,
                      attribution: 'Copyright:© 2014 City of Raleigh',
                      position: 'back'
                }
            },
            detailsIntersections: {
              name: 'Detailed Intersections',
              type: 'dynamic',
              url: 'http://mapststarcsvr1:6080/arcgis/rest/services/PublicUtility/ProjectTracking/MapServer/',
              visible: false,
              layerOptions: {
                layers: [0],
                opacity: 1,
                attribution: 'Copyright:© 2014 City of Raleigh',
                position: 'back'
              }
            },
            parcels: {
              name: 'Parcels',
              type: 'dynamic',
              url: 'http://maps.raleighnc.gov/arcgis/rest/services/Parcels/MapServer',
              visible: false,
              layerOptions: {
                layers: ['*'],
                opacity: 1,
                attribution: 'Copyright:© 2014 City of Raleigh',
                position: 'back'
              }
            }

          }


      },
  });

//Set up draw controls
var drawnItems = new L.FeatureGroup();
var options = {
  edit: {
    featureGroup: drawnItems
  },
  draw: {
    polygon: {
      shapeOptions: {
        color: 'blue'
      },
      repeatMode: false,
      allowIntersection: false
    },
    marker: false,
    circle: false,
    polyline: false,
    rectangle: false
  }
 };
 var drawControl = new L.Control.Draw(options);
 angular.extend($scope, {
   controls: {
     custom: [drawControl]
   }
 }
 );


 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 //////////////Identify Features on map/////////////////////////////////////////////////////////////////////////////////////////////

//Create features group to add identify result too
 var selectedFeatures = new L.FeatureGroup(),
     selectedGeojson;

//Set feature style
 var selectionStyle = {
  fill: false,
  weight: 5,
  opacity: 1,
  color: 'rgba(12, 235, 255, 0.71)',
  dashArray: '4'
};

//Ugly set popup hack, tried ng-repeat did work, so I am using this as a place holder
function createPopup (feature, layer) {
  var ele = '<ul>';
  for (var i in feature.properties){
    feature.properties[i] !== 'Null' && feature.properties[i] !== ''  ? ele+='<li><i>' + i + '</i>: ' + feature.properties[i] + '</li>' : ele;
  }
  ele+='</ul>';
  layer.bindPopup(ele, {
    maxHeight: 300
  });
}

leafletData.getMap('map').then(function(map) {

  //Adds timer to map
    var searchBar = L.Control.extend({
      options: {
        position: 'topcenter'
      },

      onAdd: function (map) {
        var $controlContainer = map._controlContainer,
            nodes = $controlContainer.childNodes,
            topCenter = false;

        for (var i = 0, len = nodes.length; i < len; i++) {
            var klass = nodes[i].className;
            if (/leaflet-top/.test(klass) && /leaflet-center/.test(klass)) {
                topCenter = true;
                break;
            }
        }
        if (!topCenter) {
            var tc = document.createElement('div');
            tc.className += 'leaflet-top leaflet-center';
            $controlContainer.appendChild(tc);
            map._controlCorners.topcenter = tc;
        }
        this._map = map;
        this._container = L.DomUtil.get('searchBar');
          // var container = L.DomUtil.get('searchBar');
              // container.setPosition('searchBar', [0, 0]);
          return this._container;
      }
  });

  map.addControl(new searchBar());

  //Gets layer info from map
  map.on('click', function(e){
    //Empties exisiting feature group
    selectedFeatures.clearLayers();

    map.eachLayer(function(layer){

      if (layer.options !== undefined && layer.options.layers) {
      var onClickOptions = {
        params: {
          f: 'json',
          geometry: {x: e.latlng.lng, y: e.latlng.lat},
          mapExtent: [e.latlng.lng, e.latlng.lat, e.latlng.lng + 0.01, e.latlng.lat + 0.01].toString(),
          tolerance: 2,
          imageDisplay: '600, 550, 96',
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
            selectedGeojson = L.geoJson(data, {
              onEachFeature: createPopup,
              style: selectionStyle
            });
            selectedFeatures.addLayer(selectedGeojson);
          });
          break;
        case 'http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/ReclaimedDistribution/MapServer/':
          agsServer.reclaimedMs.request(onClickOptions)
          .then(function(data){
            selectedGeojson = L.geoJson(data, {
              onEachFeature: createPopup,
              style: selectionStyle
            });
            selectedFeatures.addLayer(selectedGeojson);
          });
          break;
        case 'http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/WaterDistribution/MapServer/':
          agsServer.waterMs.request(onClickOptions)
          .then(function(data){
            selectedGeojson = L.geoJson(data, {
              onEachFeature: createPopup,
              style: selectionStyle
            });
            selectedFeatures.addLayer(selectedGeojson);
          });
          break;
        case 'http://maps.raleighnc.gov/arcgis/rest/services/PublicUtility/SewerExternal/MapServer/':
          agsServer.sewerMs.request(onClickOptions)
            .then(function(data){
              selectedGeojson = L.geoJson(data, {
                onEachFeature: createPopup,
                style: selectionStyle
              });
              selectedFeatures.addLayer(selectedGeojson);
            });
          break;
        case 'http://maps.raleighnc.gov/arcgis/rest/services/Parcels/MapServer/':
          agsServer.parcelsMs.request(onClickOptions)
          .then(function(data){
            selectedGeojson = L.geoJson(data, {
              onEachFeature: createPopup,
              style: selectionStyle
            });
            selectedFeatures.addLayer(selectedGeojson);
          });
          break;
        default:
          return;
      }

      selectedFeatures.addTo(map);
      selectedFeatures.bringToFront();
    }


    });
  });


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////Edit Controlls/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  map.on('draw:drawstart', function (e) {
    //Empties exisiting feature group
    $scope.project_docs = false;
    $scope.searchStatus = false;
    angular.element('.angular-leaflet-map').removeClass('map-move');
    angular.element('.map-edit-container').removeClass('map-edit-container-move');
    drawnItems.clearLayers();
  });
  map.on('draw:created', function (e) {
      var layer = e.layer;
      $scope.active = true;
      $scope.editLayer = layer.toGeoJSON();
      drawnItems.addLayer(layer);
      drawnItems.addTo(map);

  });
  map.on('draw:edited', function (e) {
      console.log('draw:edited');
      var layers = e.layers;
      // $scope.active = true;
      layers.eachLayer(function (layer) {
        console.log(layer);
        $scope.editLayer = layer.toGeoJSON();
      //do whatever you want, most likely save back to db
      });
  });
  map.on('draw:editstart', function (e){
    var layers = e.target;
    console.log('editstart');
    console.log(layers);
    layers.eachLayer(function(layer){
      console.log(layer);
      if (layer.feature){
        $scope.editLayer = layer.toGeoJSON();
      }

    });
    $scope.active = true;
    $scope.searchStatus = false;
  });
  map.on('draw:editstop', function (e){
    var layers = e.layers;
    console.log(e);
    console.log('draw:editstop');
    // $scope.active = false;
  });
  map.on('draw:deleted', function (e){
    //Turn off edit table
    $scope.active = false;
  });
});


angular.extend($scope, {
  markers:{},
  paths: {}
});

function action (feature, layer){
  $scope.viewData = feature;
  layer.bindPopup('<h4>PROJECT NAME:'+ feature.properties.PROJECTNAME +'</h4>');

  layer.on('mouseover', function (e) {
    $scope.viewData = feature.properties;
 });
 layer.on('mouseout', function(){
  //  layer.setStyle(styles.expiredStyle);
   //removeMarkers();
 });
}


function removeEmptyFields (data) {
    for (var a in data){
      data[a] !== null || undefined || NaN ? data[a] : delete data[a];
    }
}


$scope.autoFillProjects = function (typed) {
  //Turns on the map resulsts table
  $scope.searchStatus = false;
  $scope.project_docs = false;
  $scope.projectError = false;
  angular.element('.angular-leaflet-map').removeClass('map-move');
  //Uses the Project Search Servies
  $scope.projects = [];
  $scope.newProject = projectSearch.autoFill(typed)
    .then(function(data){
    if (data.features){
      data.features = projectSearch.getSet(data.features);
      for (var i = 0, x = data.features.length; i < x; i++){
        if ($scope.projects.length < 5){
          $scope.projects.push(data.features[i].attributes.PROJECTNAME + ':' + data.features[i].attributes.DEVPLANID + ':' + data.features[i].attributes.PROJECTID);
        }
      }
    }

  }, function (error){
    $scope.projectError = true;
  });
  //Adds the project to the recently searched cook
  scope.myrecent = $scope.projects;
};

$scope.searchControl = function (typed){
  console.log(typed);

  //Add projects to recent projects cookie
  cookies.addProjectCookie(typed);
  var selection = typed.split(':');

  var projectOptions = {
    layer: 'Project Tracking',
    geojson: true,
    actions: 'query',
    params: {
      f: 'json',
      outFields: '*',
      where: "PROJECTID =  '" + selection[2] + "'",
      outSR: 4326,
      returnGeometry: true
    }
  };

  var documentOptions = {
    layer: 'RPUD.PTK_DOCUMENTS',
    actions: 'query',
    params: {
      f: 'json',
      outFields: '*',
      where: "PROJECTID =  '" + selection[2] + "'",
    }
  };

  agsServer.ptFs.request(projectOptions)
    .then(function(data){
      console.log(data);
      //Prepare Results Table
      $scope.project_info = data.features[0].properties;
      $scope.project_info.CREATEDON = $filter('date')($scope.project_info.CREATEDON, 'MM/dd/yyyy');
      $scope.project_info.DEVPLAN_APPROVAL = $filter('date')($scope.project_info.DEVPLAN_APPROVAL, 'MM/dd/yyyy');
      $scope.project_info.EDITEDON = $filter('date')($scope.project_info.EDITEDON, 'MM/dd/yyyy');
      removeEmptyFields($scope.project_info);

      //Turns on the map resulsts table
      $scope.searchStatus = true;

      //Empties exisiting feature group
      drawnItems.clearLayers();

      //Sets geojson object and adds each layer to featureGroup as a layer, so it can be edited
      L.geoJson(data, {
        onEachFeature: function (feature, layer) {
          drawnItems.addLayer(layer);
        }
      });

      leafletData.getMap('map').then(function(map) {
        //Get bounds from geojson and fits to map
        map.fitBounds(drawnItems.getBounds());
        //add project to map
        drawnItems.addTo(map);
        console.log('made it');
      });

      //Get Document Information for carousel
      // agsServer.ptFs.request(documentOptions)
      //   .then(function(data){
      //     if (data.features.length !== 0){
      //           angular.element('.angular-leaflet-map').addClass('map-move');
      //           angular.element('.map-edit-container').addClass('map-edit-container-move');
      //           var _docType;
      //           $scope.project_docs = data.features.map(function (each){
      //
      //             each.attributes.DOCTYPEID ? _docType = each.attributes.DOCTYPEID.toLowerCase() : _docType = '';
      //             var url = {
      //                 url : $sce.trustAsResourceUrl(projectConstants.documentBaseUrl + each.attributes.PROJECTID + '/' + each.attributes.PROJECTID + '-' + each.attributes.DOCTYPEID + '-' + each.attributes.DOCID + '.pdf'),
      //                 name: each.attributes.PROJECTID + '-' + each.attributes.DOCTYPEID + '-' + each.attributes.DOCID,
      //                 resid: each.attributes.PROJECTID + '-' + each.attributes.DOCTYPEID + '-' + each.attributes.DOCID + 'res',
      //                 icon: '../images/' + _docType + '.png'
      //             };
      //             return url;
      //           });
      //           for (var a in $scope.project_docs){
      //             var ele_id = '#' + $scope.project_docs[a].resid;
      //             $(ele_id).resizable();
      //           }
      //         }
      //   });

    });



};


$scope.list1 = {title: 'AngularJS - Drag Me'};

//Setting Up Printing Service
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var printTask = 'http://mapstest.raleighnc.gov/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/execute';
$scope.dpi = 90;
$scope.print_format = 'PDF';
$scope.exportSizes = [
  {
    size: [500, 500]
  },
  {
    size: [700, 500]
  },
  {
    size: [700, 1000]
  }
];
$scope.printFormatList = ['PDF', 'PNG8', 'PNG32', 'JPG', 'GIF', 'EPS', 'SVG',  'SVGZ'];
var web_map_specs = {
  mapOptions:{ },
  operationalLayers: [ ],
  baseMap: [{
    title: 'Basemap',
    baseMapLayers:[
      {
          url: 'http://maps.raleighnc.gov/arcgis/rest/services/BaseMap/MapServer',
          opacity: 1
      }
    ]
  }],
  exportOptions: {
      dpi: $scope.dpi,
      outputSize: [700, 500] || $scope.output
  }
  // "layoutOptions": { }
};

leafletData.getMap('map').then(function(map) {
    // web_map_specs.operationalLayers = [];
    map.on('move', function(){
      $scope.mapbounds = map.getBounds();
      web_map_specs.mapOptions.extent = {
        xmin: $scope.mapbounds._southWest.lat,
        ymin: $scope.mapbounds._southWest.lng,
        xmax: $scope.mapbounds._northEast.lat,
        ymax: $scope.mapbounds._northEast.lng
      };
      web_map_specs.operationalLayers = [];
        map.eachLayer(function (layer){
          //console.log(layer);
          //console.log(map.hasLayer(layer));

          map.hasLayer(layer) ? web_map_specs.operationalLayers.push({url: layer.url}) : console.log('No layers added to print');
        });
    });
    //Adds print control to map
    var printer = L.control({position: 'bottomright'});
    printer.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = '<button class="btn btn-primary btn-sm mapPrint" data-toggle="modal" data-target="#myModal">Print</button>';
        return div;
      };
printer.addTo(map);


});

$scope.print_params = {
  Web_Map_as_JSON: web_map_specs,
  format: $scope.print_format,
  Layout_Template: 'MAP_ONLY',
  f: 'json'
};

  $scope.$watch('print_params', function(newVal, oldVal){
    // console.log($scope.print_params);
}, true);

$scope.printMap = function () {
  $http.get(printTask, {
    params: $scope.print_params,
    headers: {
      'Content-Type': 'text/plain'
    }
  })
    .success(function(res){
      console.log(res);
    });
};

  }]);
