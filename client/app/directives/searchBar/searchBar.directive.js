(function(){
  'use strict';

  angular
    .module('pumprApp')
    .directive('searchBar', searchBar);

    searchBar.$inject = ['$interval', '$location', 'search', 'leafletData'];

  function searchBar($interval, $location, search, leafletData) {
    var directive = {
      templateUrl: 'app/directives/searchBar/searchBar.html',
      restrict: 'E',
      transclude: true,
      scope: {
        view: '@',
        mapid: '@'
      },
      controller: controller,
      controllerAs: 'vm',
      bindToController: true,
      link: link
    };
    return directive;

    function controller() {
      var vm = this;
      vm.autoFillProjects = autoFillProjects;
      vm.searchControl = searchControl;
      vm.searchStatus = false;
      vm.projectDocs = false;
      vm.projectError = false;
      vm.projects = [];
      vm.newProject;

      activate();

      function activate() {
        var count = 0,
        options = ['Search by Project Name...', 'Search by Project id...', 'Search by Development Plan Id...', 'Search by Address...', 'Search by Street...', 'Search by Facility Id'];
        $interval(rotatePlaceholder, 3000);

        function rotatePlaceholder() {
          count = count > 4 ? 0 : count;
          vm.placeholder = options[count];
          count++;
        }
      }

      function autoFillProjects(typed) {
        var filtered, unique, results;
        vm.searchStatus = false;
        vm.projectDocs = false;
        vm.projectError = false;
        vm.projects = [];
        vm.myrecent;
        vm.newProject = search.all(typed);

        return vm.newProject
          .then(prepareAutoComplete)
          .catch(function(err){
            vm.projectError = true;
          });
        vm.myrecent = vm.projects;

        function prepareAutoComplete(res) {
          if (Array.isArray(res)){
            filtered = _.flatten(res);
          }
          if (Array.isArray(filtered) && res.length === 0){
            vm.projects.push('Sorry Project Not Found...');
            return vm.projects;
          }
          else {
            unique = _.uniq(filtered);
            results = _(unique)
              .groupBy('group')
              .map(tagFirstInGroup)
              .flatten()
              .value();
            return results;
          }

          function tagFirstInGroup(g) {
            g[0].firstInGroup = true;
            return g;
          }
        }
      }
        //Function handles the selection
      function searchControl(typed){
        var path;
        if (typed === 'Sorry Project Not Found...'){
          return;
        }
        switch(vm.view){
          case 'main':
            mainViewRouter();
            break;
          case 'addDoc':
            $location.path('/addDocument/' + typed.name.split(':')[2]);
            break;
          case 'map':
            findOnMap();
            break;
          default:
            $location.url('/project/' + typed.name.split(':')[2]);
        }

        function mainViewRouter() {
          switch(typed.group) {
            case 'project':
              $location.url('/project/' + typed.name.split(':')[2]);
              break;
            case 'address':
              path =  '/map?' + $.param(typed);
              location = path;
            case 'facilityid':
              path =  '/map?' + $.param(typed);
              location = path;
            default:
              console.error('Group Not Recognized', typed.group);
          }
        }

        function findOnMap() {
          var selectedFeatures = new L.FeatureGroup();
          selectedFeatures.clearLayers();
          leafletData.getMap(vm.mapid)
            .then(function(map) {
              switch(typed.group) {
                case 'project':
                  var projectid = typed.name.split(':')[2];
                  search.display(projectid)
                    .then(function(res) {
                      L.geoJson(res, {
                        style: {
                          color: 'rgb(54, 186, 252)'
                          },
                          onEachFeature: function (feature, layer) {
                            var ele = '<a href="/project/'+ projectid +'">View Project</a>'
                            layer.bindPopup(ele);
                            selectedFeatures.addLayer(layer);
                          }
                      });
                      map.fitBounds(selectedFeatures.getBounds());
                      //add project to map
                      selectedFeatures.addTo(map);
                    })
                    .catch(function(err) {
                      console.error(err)
                    })
                  break;
                case 'address':
                  path =  '/map?' + $.param(typed);
                  location = path;
                case 'facilityid':
                  path =  '/map?' + $.param(typed);
                  location = path;
                default:
                  console.error('Group Not Recognized', typed.group);
              }
            });
        }
      }
    }

    function link(scope, el, attr, vm) {
      if (!vm.mapid){
        return;
      }
      else {
        leafletData.getMap(vm.mapid)
          .then(function(map) {
            var searchBar = L.Control.extend({
              options: {
                position: 'topleftish'
              },

              onAdd: function (map) {
                var $controlContainer, nodes, nodeLen, topleftish, klass, tc, i;

                $controlContainer = map._controlContainer;
                nodes = $controlContainer.childNodes;
                topleftish = false;
                nodeLen = nodes.length;
                for (i = 0; i < nodeLen; i++) {
                  klass = nodes[i].className;
                  if (/leaflet-top/.test(klass) && /leaflet-leftish/.test(klass)) {
                    topleftish = true;
                    break;
                  }
                }
                if (!topleftish) {
                  tc = document.createElement('div');
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
      }
    }
  }
})();
