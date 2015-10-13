/* fireflow.directive.js */

/**
* @desc Controls the fireflow map control
* @example <fireflow-form hydrants="markers"></fireflow-form>
*/

(function(){
  'use strict';

  angular
    .module('pumprApp')
    .directive('fireflow', fireflow);

    fireflow.$inject = ['fireflowFactory', 'leafletData'];

  function fireflow(fireflowFactory, leafletData) {
    var directive = {
      templateUrl: 'app/directives/fireflow/fireflow.html',
      transclude: true,
      restrict: 'E',
      scope: {
        hydrants: '='
      },
      controller: controller,
      controllerAs: 'vm',
      link: link
    };

    return directive;

    function controller() {
      var vm = this;
      var flowControl;
      leafletData.getMap('fireflow-map')
        .then(function(map) {
          //Add Custom controls
          flowControl = L.Control.extend({
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
        });
    }

    function link(scope) {
      scope.type= '0% Complete';
      scope.dynamic = 0;
      scope.test;
      scope.flow;
      scope.remove = fireflowFactory.removeLog;
      scope.setFormStatus = fireflowFactory.setFormStatus;
      scope.$watchCollection('hydrants', function(){
        if (Array.isArray(scope.hydrants)){
          switch (scope.hydrants.length){
            case 0:
              break;
            case 1:
              scope.test = scope.hydrants[0];
              scope.dynamic = (1/3) * 100;
              scope.type= '33% Complete';
              break;
            case 2:
              scope.flow = scope.hydrants[1];
              scope.dynamic = (2/3) * 100;
              scope.type= '66% Complete';
              break;
            default:
              return;
          }
        }
      });
    }
  }
})();
