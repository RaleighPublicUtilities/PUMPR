'use strict';

angular.module('pumprApp')
  .service('streetSearch', ['agsServer', function(agsServer){

    //Auto fill function for street names
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
          return agsServer.streetsMs.request(streetOptions);
        };

}]);
