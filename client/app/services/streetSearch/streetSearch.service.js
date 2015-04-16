'use strict';

angular.module('pumprApp')
  .service('streetSearch', ['agsServer.service', function(agsServer.service){

    //Auto fill function for street names
        var streets = [];
        this.autoFill = function (typed) {
          typed = typed.toUpperCase();


          var streetOptions = {
            layer: 'Streets',
            geojson: false,
            actions: 'query',
            params: {
              f: 'json',
              outFields: 'CARTONAME',
              text: typed,
              returnGeometry: false,
              orderByFields: 'CARTONAME ASC'
            }
          };
          return agsServer.service.streetsMs.request(streetOptions);
        };

}]);
