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

    //Takes array of addresses and buffers results by 0.5 mile returns esri json multipolygon
    function createBuffer(data, callback){
      var fc, candidates, features, arcgisMultipolygon;
      candidates = data.candidates;

        features = candidates.map(function(item){
          var rObj = turf.point([item.location.x, item.location.y], item.attributes),
              buffered = turf.buffer(rObj, 0.5, 'miles');
              return buffered.features[0];
        });

        fc = turf.featurecollection(features);
        arcgisMultipolygon = Terraformer.ArcGIS.convert(fc)
        callback(arcgisMultipolygon);
      }

    //Takes esri json multipolygon and returns projects that intersect
    function projectIntersect (data){
      var projectOptions = {
        layer: 'Project Tracking',
        geojson: false,
        actions: 'query',
        params: {
          f: 'json',
          outFields: 'PROJECTNAME,DEVPLANID,PROJECTID',
          where: "1=1",
          returnGeometry: false,
          orderByFields: 'PROJECTNAME ASC',
          inSR: 4326,
          geometryType: 'esriGeometryPolygon',
          geometry: data.geometry
        }
      };

      return agsServer.ptMs.request(projectOptions);
    }



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
      addresses: function(typed){
        var deferred;
        typed = clean4Ags(typed);

          var addressOptions  = {
              f: 'json',
              address: typed,
              outSR: 4326,
              outFields: '*',
              returnGeometry: true,
              maxLocations: 5
          };

        deferred = $q.defer();

        agsServer.geocoder(addressOptions)
          .then(function(data){

            if (data.candidates.length > 0){

              createBuffer(data,function(buffer){
                projectIntersect(buffer[0])
                  .then(function(res){
                    deferred.resolve(res);
                  },
                  function(){
                    deffer.reject('No projects found');
                  })

              });

            }
            else{
              deferred.resolve([]);
            }
          })
          .catch(function(err){
             deferred.reject(err);
          });

          return deferred.promise;

      },

      //Lookup project by permit #
      permits: function(){

      },

      //Lookup Address
      street: function(typed){
        typed = clean4Ags(typed);

        //Reused options for location and address search
        var streetOptions = {
          layer: 'Streets',
          geojson: true,
          actions: 'query',
          params: {
            f: 'json',
            outSR: 4326,
            text: typed,
            outFields: 'CARTONAME',
            returnGeometry: true,
            orderByFields: 'CARTONAME ASC'
          }
        };

        return agsServer.streetsMs.request(streetOptions);

      },

      //Searches all posible options returns promise when all resolve
      all: function(typed){
        //Generate promises for all search vectors
        var project = this.projects(typed),
            location = this.locations(typed),
            permits = this.permits(typed);

        return $q.all([projects, addresses, permits]);

      }


    }; //end search object


    return (search);


  }]);
