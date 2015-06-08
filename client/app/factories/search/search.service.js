'use strict';

angular.module('pumprApp')
  .factory('search', ['agsServer', '$q', function (agsServer, $q) {
    // Service logic
    // ...

    //Clean data before searching in ArcGIS Server
    function clean4Ags(typed){
      typed = typed.toUpperCase();
      //Allows apostrophe (single quote) to be searched
      typed = typed.replace("'", "''");
      return typed;
    }

    //Reused options for location and address search
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

    // Public API here
    var search = {

      //Lookup Project by metadata
      projects: function (typed){
        typed = clean4Ags(typed);

        var projectOptions = {
          layer: 'Project Tracking',
          geojson: false,
          actions: 'query',
          params: {
            f: 'json',
            outFields: 'PROJECTNAME,DEVPLANID,PROJECTID',
            where: "PROJECTNAME like '%" +typed + "%' OR DEVPLANID like '%" +typed + "%' OR PROJECTID like '%" +typed + "%' OR ALIAS like '%" +typed + "%' OR FORMERNAME like'%" +typed + "%'",
            returnGeometry: false,
            orderByFields: 'PROJECTNAME ASC'
          }
        };

        return agsServer.ptMs.request(projectOptions);

      },

      //Lookup project by location
      locations: function(typed){
        typed = clean4Ags(typed);
        var deferred = $q.defer();
        streetOptions.params.text = typed;


        agsServer.streetsMs.request(streetOptions).
          success(function(data, status){
            deferred.resolve(data);
          }).
          error(function(data, status){
            deferred.reject(data);
          });

          return deferred.promise;

      },

      //Lookup project by permit #
      permits: function(){

      },

      //Lookup Address
      addresses: function(typed){
        typed = clean4Ags(typed);
        
        streetOptions.params.text = typed;

        return agsServer.streetsMs.request(streetOptions);

      },

      //Searches all posible options returns promise when all resolve
      all: function(typed){
        //Generate promises for all search vectors
        var project = this.projects(typed),
            location = this.locations(typed),
            permits = this.permits(typed);

        return $q.all([projects, locations, permits]);

      }


    }; //end search object


    return (search);


  }]);
