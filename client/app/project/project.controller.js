'use strict';

angular.module('pumprApp')
  .controller('ProjectCtrl', ['$scope', '$location', '$timeout', 'agsServer', 'leafletData', 'Auth', 'search', 'mapLayers',
    function ($scope, $location, $timeout, agsServer, leafletData,  Auth, search, mapLayers) {
    // //Set up GET request options
    //
    $scope.agsToken = Auth.getAgolToken();
    mapLayers.overlays.sewer.visible = true;
    mapLayers.overlays.reuse.visible = true;
    mapLayers.overlays.water.visible = true;
    mapLayers.overlays.water.layerParams = {
        token: $scope.agsToken
    },
    $scope.errorMessage = false;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.message = {
       docs: true,
       error: ''
     };

     angular.extend($scope, {
         layers: mapLayers,
     });


     $scope.itpipesView = {status: false, facid: undefined, message: 'Unable to identify sewer gravity or force main', error: false};
     $scope.treeView = false;
     $scope.chartView = true;
    var m = [20, 120, 20, 120],
    w = 1000 - m[1] - m[3],
    h = 800 - m[0] - m[2],
    i = 0,
    root;

    $scope.tabs = [
      { title:'Dynamic Title 1', content:'Dynamic content 1' },
      { title:'Dynamic Title 2', content:'Dynamic content 2', disabled: true }
    ];
/*hell
dsfs
*/
var tree = d3.layout.tree()
    .size([h, w]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var vis = d3.select('#tree').append('svg:svg')
    .attr('width', '100%')
    .attr('height', h + m[0] + m[2])
  .append('svg:g')
    .attr('transform', 'translate(' + m[3] + ',' + m[0] + ')');


     $scope.labels = ['ACCEPTANCE LETTER', 'AS-BUILT DRAWING', 'CONSTRUCTION DRAWING', 'PERMIT', 'PLAT', 'STATEMENT OF COST', 'WAIVER', 'WARRANTY LETTER'];
     $scope.series = ['Document Types', 'Total Documents'];
     $scope.data = [
       [0,0,0,0,0,0,0,0],
       [0,0,0,0,0,0,0,0],
     ];

    $scope.projectid = $location.path().split('/')[2];
    $scope.projectname;
    $scope.searchPromise =search.display($scope.projectid)
      .then(function(res){
      console.log(res[0]);
      console.log(res[1]);
      var project = res[0];
      var docs = res[1];
      $scope.firms = docs.map(function(item){
        return item.attributes.ENGID;
      });

      $scope.projectname = project.features[0].properties['Project Name'];
      $scope.projectInfo = project.features[0].properties;
      $scope.projectInfo = removeEmptyFields($scope.projectInfo);
      if ((Array.isArray(docs) && docs.length === 0)){
        $scope.message = {
          docs: false,
          error: 'No Documents are currently loaded.'
        };
      }
      else {
        $scope.message = {
           docs: true,
           error: ''
         };



      var selectedFeatures = new L.FeatureGroup();
      leafletData.getMap('project-map').then(function(map) {

        map.on('click', function(e){
          //reset for search
          $scope.itpipesView = {status: true, facid: undefined, message: 'Unable to identify sewer gravity or force main', error: false};
          selectedFeatures.clearLayers();
          var size = map.getSize();
          var imgSize = [size.x, size.y, 96].join();
          var onClickOptions = {
            params: {
              f: 'json',
              geometry: {x: e.latlng.lng, y: e.latlng.lat},
              mapExtent: [e.latlng.lng, e.latlng.lat, e.latlng.lng + 0.01, e.latlng.lat + 0.01].toString(),
              tolerance: 1,
              imageDisplay: imgSize,
              layers: 'http://maps.raleighnc.gov/arcgis/rest/services/PublicUtility/SewerExternal/MapServer/',
              sr: 4326
            },
            actions: 'identify',
            geojson: true
          };

          $scope.itpipesPromise = agsServer.sewerMs.request(onClickOptions)
            .then(function(data){
              var selectedGeojson = L.geoJson(data, {
                style: {
                  color: 'rgb(0, 255, 29)'
                }
              });
              selectedFeatures.addLayer(selectedGeojson);
              selectedFeatures.addTo(map);
              selectedFeatures.bringToFront();
              $scope.itpipesView.status = true;
              if (Array.isArray(data.features) && data.features.length > 0){
                $scope.itpipesView.facid = data.features[0].properties['Facility Identifier'];
              }
            })
            .catch(function(err){
              $scope.itpipesView.status = false;
              $scope.itpipesView.error = true;
            });
        });

        L.geoJson(res, {
          style: {
            color: 'rgb(151, 187, 205)'
          },
          onEachFeature: function (feature, layer) {
            map.fitBounds(layer.getBounds());
          }
        }).addTo(map);
      });


        $scope.docs = docs;
        $timeout(function(){
        createGraph(docs, function(graph){
          generateGraph(docs, graph, function(json){
            root = json;
            root.x0 = h / 2;
            root.y0 = 0;

            function toggleAll(d) {
              if (d.children) {
                d.children.forEach(toggleAll);
                toggle(d);
              }
            }

            update(root);
            getBarChartData($scope.labels, json);
          });
        });
      }, 500);
    }
    })
    .catch(function(err){
      $scope.errorMessage = true;
    });

  //Sets the basemap
  // leafletData.getMap('project-map').then(function(map) {
  //   L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.3hqcl3di/{z}/{x}/{y}.png').addTo(map);
  // });
$scope.controlViews = function (view){
  switch(view){
    case 'tree':
      $scope.treeView = true;
      // $scope.chartView = false;
      break;
    case 'eng':
      $scope.treeView = false;
      // $scope.chartView = true;
      break;
    case 'itpipes':
      $scope.treeView = false;
      // $scope.chartView = false;
      break;
    default:
      $scope.treeView = false;
      // $scope.chartView = false;
  }

}



  function getBarChartData (labels, graph){
    for (var a = 0, len = labels.length; a < len; a++){
      for (var i in graph.children){
        if (graph.children[i].name === labels[a]){
          var total = 0;
          for (var q in graph.children[i].children){
            total+= graph.children[i].children[q].children.length;
          }
          $scope.data[0].splice(a, 1, graph.children[i].children.length);
          $scope.data[1].splice(a, 1, total);
          break;
        }
      }
    }
  }



  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };


function createGraph(data, cb){
  var graph = {
    name: data[0].attributes.PROJECTNAME,
    children: []
  };

  data.forEach(function(i){
    checkAndAdd(i.attributes.DOCUMENTTYPE, graph.children);
  });
  cb(graph);
}

function checkAndAdd(name, arr) {
  var found = arr.some(function (el) {
    return el.name === name;
  });
  if (!found) { arr.push({ name: name, children: [] }); }
}

function addGraphLayer(arr, data, match, attr){
  for (var a in arr){
    if (arr[a].name === data[match]){
      arr[a].children.push({name: $scope.projectid + '-' + data.DOCTYPEID + '-' + data[attr]});
    }
  }
}

function generateGraph(data, graph, cb){
  data.forEach(function(i){
    for (var n in graph.children){
      if (graph.children[n].name === i.attributes.DOCUMENTTYPE){
        // console.log(i.attributes)
        checkAndAdd(i.attributes.SHEETTYPE, graph.children[n].children);
        addGraphLayer(graph.children[n].children, i.attributes, 'SHEETTYPE', 'DOCID');
      }
    }
  });
  cb(graph);
}



function update(source) {
  var duration = d3.event && d3.event.altKey ? 5000 : 500;

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse();

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = vis.selectAll('g.node')
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append('svg:g')
      .attr('class', 'node')
      .attr('transform', function() { return 'translate(' + source.y0 + ',' + source.x0 + ')'; })
      .on('click', function(d) { toggle(d); update(d); });

  nodeEnter.append('svg:circle')
      .attr('r', 1e-6)
      .style('fill', function(d) { return d._children ? 'lightsteelblue' : '#fff'; });


  nodeEnter.append('svg:text')
      .attr('x', function(d) { return d.children || d._children ? 40 : 10; })
      .attr('dy', '2em')
      .attr('text-anchor', function(d) { return d.children || d._children ? 'end' : 'start'; })
      .text(function(d) { return d.name; })
      .style('fill-opacity', 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')'; });

  nodeUpdate.select('circle')
      .attr('r', 4.5)
      .style('fill', function(d) { return d._children ? 'lightsteelblue' : '#fff'; });

  nodeUpdate.select('text')
      .style('fill-opacity', 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr('transform', function() { return 'translate(' + source.y + ',' + source.x + ')'; })
      .remove();

  nodeExit.select('circle')
      .attr('r', 1e-6);

  nodeExit.select('text')
      .style('fill-opacity', 1e-6);

  // Update the links…
  var link = vis.selectAll('path.link')
      .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert('svg:path', 'g')
      .attr('class', 'link')
      .attr('d', function() {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr('d', diagonal);

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr('d', diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr('d', function() {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children.
function toggle(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  if (d.depth === 3){
    // console.log(d);
    var url = $location.path() + '/';
    $location.url( url + d.name);
    $scope.$apply();
  }
}

function removeEmptyFields (data) {
    for (var a in data){
      data[a] === 'Null' | null | '' ? delete data[a] : data[a];
    }
    return data;
  }





  }]);
