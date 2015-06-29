'use strict';

angular.module('pumprApp')
  .controller('AddProjectCtrl', ['$scope', '$filter', '$sce', 'leafletData', 'search', 'agsServer', '$interval', 'mapLayers', '$compile', '$cookieStore',
    function ($scope, $filter, $sce, leafletData, search, agsServer, $interval, mapLayers, $compile, $cookieStore) {

    //Make map height 100%
    angular.element('body').find('div').addClass('fullScreen');

    //Set defaults
    $scope.agsToken = $cookieStore.get('agolToken');
    $scope.searchStatus = false;
    mapLayers.overlays.water.visible = false;
    mapLayers.overlays.water.layerParams = {
        token: $scope.agsToken
    },
    mapLayers.overlays.sewer.visible = false;
    mapLayers.overlays.reuse.visible = false;
  //create a map in the "map" div, set the view to a given place and zoom
  angular.extend($scope, {
      center: {
        lat: 35.77882840327371,
        lng: -78.63945007324219,
        zoom: 13
      },
      layers: mapLayers
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
  var el = document.createElement('leaflet-pop'),
      linkFunction = $compile(angular.element(el)),
      newScope = $scope.$new();
      newScope.features = feature.properties;
      newScope.featuresGroup = selectedFeatures;
  console.log(selectedFeatures);
  layer.bindPopup(linkFunction(newScope)[0], {
    maxHeight: 300
  });
}

leafletData.getMap('map').then(function(map) {


//Add Custom Controls//////////////////////////////////////////////////////////////////////
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
          // var container = L.DomUtil.get('searchBar');
              // container.setPosition('searchBar', [0, 0]);
          return this._container;
      }
  });

  map.addControl(new searchBar());

  //Add Project Table
  var projectTable = L.Control.extend({
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
      this._container = L.DomUtil.get('mapTable');
        // var container = L.DomUtil.get('searchBar');
            // container.setPosition('searchBar', [0, 0]);
        return this._container;
    }
});

map.addControl(new projectTable());


//Add Map edit table
var mapEdit = L.Control.extend({
  options: {
    position: 'topright'
  },

  onAdd: function (map) {
    this._container = L.DomUtil.get('mapEdit');
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

map.addControl(new mapEdit());




//////////////////////////////////////////////////////////////////////////////////////////////
  //Gets layer info from map
  map.on('click', function(e){
    //Empties exisiting feature group
    selectedFeatures.clearLayers();
      var size = map.getSize();
      var imgSize = [size.x, size.y, 96].join();
    map.eachLayer(function(layer){

      if (layer.options !== undefined && layer.options.layers) {
      var onClickOptions = {
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
      console.log(layer.options.url)
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
        case 'http://maps.raleighnc.gov/arcgis/rest/services/PublicUtility/WaterDistribution/MapServer/':
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
        case 'http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/RPUD_Projects/MapServer/':
            agsServer.cip.request(onClickOptions)
            .then(function(data){
              selectedGeojson = L.geoJson(data, {
                onEachFeature: createPopup,
                style: selectionStyle
              });
              selectedFeatures.addLayer(selectedGeojson);
            });
            break;
        case 'http://geodevapplv1:6080/arcgis/rest/services/Networkfleet/MapServer/':
          console.log('MadeIt')
          agsServer.vechMs.request(onClickOptions)
          .then(function(data){
            console.log(data)
            selectedGeojson = L.geoJson(data, {
              onEachFeature: createPopup,
              style: selectionStyle
            });
            selectedFeatures.addLayer(selectedGeojson);
          })
          .catch(function(err){
            console.log(err);
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
    // angular.element('.angular-leaflet-map').removeClass('map-move');
    // angular.element('.map-edit-container').removeClass('map-edit-container-move');
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


      function rotatePlaceholder (){
        var count = 0;
        var options = ['Search by Project Name...', 'Search by Project id...', 'Search by Development Plan Id...', 'Search by Address...', 'Search by Street...', 'Search by Facility Id' ];
        $interval(function(){
          count = count > 4 ? 0 : count;
          $scope.placeholder = options[count];
          count++;
        }, 3000);
      }

      rotatePlaceholder();

$scope.autoFillProjects = function (typed) {
  //Turns on the map resulsts table
  $scope.searchStatus = false;
  $scope.project_docs = false;
  $scope.projectError = false;
  // angular.element('.angular-leaflet-map').removeClass('map-move');
  //Uses the Project Search Servies
  $scope.projects = [];
  $scope.newProject = search.all(typed);
   return $scope.newProject
    .then(function(res){
      var results = res[0].features.concat(res[1].features, res[2].features);

      if (results.length === 0){
        $scope.projects.push('Sorry Project Not Found...');
        return $scope.projects;
      }
      else{
          return results.map(function(item){
            return item.attributes.PROJECTNAME + ':' + item.attributes.DEVPLANID + ':' + item.attributes.PROJECTID;
          });
      }

    })
    .catch(function(err){
      $scope.projectError = true;
    });
};

$scope.searchControl = function (typed){
  console.log(typed);


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



  }]);
