'use strict';

angular.module('pumprApp')
  .factory('search', function () {
    // Service logic
    // ...


    // Public API here
    var search = {

      //Lookup Project by metadata
      project: function (){

      },

      //Lookup project by location
      location: function(){

      },

      //Lookup project by permit #
      permit: function(){

      },

      //Lookup Address
      address: function(typed){
        //Auto fill function for street names
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

      }


    }; //end search object


    return (search);

    };
  });
