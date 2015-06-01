'use strict';

angular.module('pumprApp')
  .controller('ProjectCtrl', ['$scope', '$location', '$timeout', 'agsServer', 'leafletData', 'Auth', function ($scope, $location, $timeout, agsServer, leafletData,  Auth) {
    // //Set up GET request options
    //
    $scope.isLoggedIn = Auth.isLoggedIn;
    
    var m = [20, 120, 20, 120],
    w = 1280 - m[1] - m[3],
    h = 800 - m[0] - m[2],
    i = 0,
    root;

/*hell
dsfs
*/
var tree = d3.layout.tree()
    .size([h, w]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var vis = d3.select('#tree').append('svg:svg')
    .attr('width', w + m[1] + m[3])
    .attr('height', h + m[0] + m[2])
  .append('svg:g')
    .attr('transform', 'translate(' + m[3] + ',' + m[0] + ')');


    $scope.supportTables = [
      {
          name: 'engTypes',
          id: 'RPUD.ENGINEERINGFIRM',
          joinField: 'ENGID',
          addField: 'SIMPLIFIEDNAME',
      },
      {
          name: 'sheetTypes',
          id: 'RPUD.SHEETTYPES',
          joinField: 'SHEETTYPEID',
          addField: 'SHEETTYPE',
      },
      {
          name: 'docTypes',
          id: 'RPUD.DOCUMENTTYPES',
          joinField: 'DOCTYPEID',
          addField: 'DOCUMENTTYPE',
      }
     ];


     $scope.labels = ['ACCEPTANCE LETTER', 'AS-BUILT DRAWING', 'CONSTRUCTION DRAWING', 'PERMIT', 'PLAT', 'STATEMENT OF COST', 'WAIVER', 'WARRENTY LETTER'];
     $scope.series = ['Document Types', 'Total Documents'];
     $scope.data = [
       [0,0,0,0,0,0,0,0],
       [0,0,0,0,0,0,0,0],
     ];

    $scope.projectid = $location.path().split('/')[2];
    $scope.projectname;
    var options = {
      layer: 'RPUD.PTK_DOCUMENTS',
      actions: 'query',
      params: {
        f: 'json',
        where: 'PROJECTID = ' + $scope.projectid,
        outFields: '*',
        orderByFields: 'DOCID ASC',
        returnGeometry: false
      }
    };

    //Options for search
  var searchOptions = {
    params: {
      f: 'json',
      searchText: $scope.projectid,
      searchFields: 'PROJECTID',
      layers: 'Project Tracking, RPUD.PTK_DOCUMENTS', //Use layer names or layer ids
      sr: 4326
    },
    actions: 'find',
    geojson: true
  };
  //Sets the basemap
  leafletData.getMap('project-map').then(function(map) {
    L.tileLayer('https://{s}.tiles.mapbox.com/v3/examples.3hqcl3di/{z}/{x}/{y}.png').addTo(map);
  });
  //Get project data from server
  agsServer.ptMs.request(searchOptions).then(function(res){
     console.log(res);
     $scope.projectname = res.features[0].properties['Project Name'];
     $scope.projectInfo = res.features[0].properties;
     $scope.projectInfo = removeEmptyFields($scope.projectInfo);
     leafletData.getMap('project-map').then(function(map) {
       L.geoJson(res, {
         style: {
           color: 'rgb(151, 187, 205)'
         },
         onEachFeature: function (feature, layer) {
           map.fitBounds(layer.getBounds());
         }
       }).addTo(map);
     });
   },
   function (err){
       console.log(err);
   });

   $scope.message = {
     docs: true,
     error: ''
   };
    agsServer.ptFs.request(options).then(function(data){
      if (data.error || (Array.isArray(data.features) && data.features.length === 0)){
        $scope.message = {
          docs: false,
          error: 'No Documents are currently loaded.'
        };
      }
      else {

        return data.features;
      }

    }, function(err){
      console.log(err);
    })
    .then(function(data){
      $scope.supportTables.forEach(function(table){
        var name = table.name;

        var options = {
          layer: table.id,
          actions: 'query',
          params: {
            f: 'json',
            where: '1=1',
            outFields: '*',
            orderByFields: table.addField + ' ASC',
            returnGeometry: false
          }
        };
        agsServer.ptFs.request(options).then(function(d){
          table.data = d.features;
          agsServer.addFieldFromTable(data, table.data, table.joinField, table.addField);

        });
      });
      return data;
    }, function(err){
      console.log('Issue joining tables');
    })
    .then(function(data){
      $scope.docs = data;
      $timeout(function(){
      createGraph(data, function(graph){
        generateGraph(data, graph, function(json){
          console.log(json);
          root = json;
          root.x0 = h / 2;
          root.y0 = 0;

          function toggleAll(d) {
            if (d.children) {
              d.children.forEach(toggleAll);
              toggle(d);
            }
          }

          // Initialize the display to show a few nodes.
          root.children.forEach(toggleAll);


          update(root);
          getBarChartData($scope.labels, json);
        });
      });
    }, 1000);
    });

  function getBarChartData (labels, graph){
    for (var a = 0, len = labels.length; a < len; a++){
      for (var i in graph.children){
        if (graph.children[i].name === labels[a]){
          var total = 0;
          for (var q in graph.children[i]._children){
            total+= graph.children[i]._children[q]._children.length;
          }
          $scope.data[0].splice(a, 1, graph.children[i]._children.length);
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

  console.log(nodeEnter);
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
      data[a] === 'Null' ? delete data[a] : data[a];
    }
    console.log(data);
    return data;
  }



  }]);
