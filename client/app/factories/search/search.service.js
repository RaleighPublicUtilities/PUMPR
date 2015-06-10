'use strict';

angular.module('pumprApp')
  .factory('search', ['agsServer', '$q', '$interval', function (agsServer, $q, $interval) {
    // Service logic
    // ...

    //Clean data before searching in ArcGIS Server
    function clean4Ags(typed){
      typed = typed.toUpperCase();
      //Allows apostrophe (single quote) to be searched
      typed = typed.replace("'", "''");
      return typed;
    }

    //Takes array of addresses and buffers results by 0.25 mile returns esri json multipolygon
    function createBuffer(data, callback){
      var fc, candidates, features, arcgisMultipolygon;
      candidates = data.candidates;

        features = candidates.map(function(item){
          var rObj = turf.point([item.location.x, item.location.y], item.attributes),
              buffered = turf.buffer(rObj, 0.25, 'miles');
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


/////////////////////////////////////////////////////////////////////////////////////////////////////
    // Public API here
    var search = {

      //Find a single project
      project: function (projectid){

        var options = {
          params: {
            f: 'json',
            searchText: projectid,
            searchFields: 'PROJECTID',
            layers: 'Project Tracking', //Use layer names or layer ids
            sr: 4326
          },
          actions: 'find',
          geojson: true
        };

        return agsServer.ptMs.request(options);

      },

      //Find projects documents
      documents: function (projectid){
        var options = {
          layer: 'RPUD.PTK_DOCUMENTS',
          actions: 'query',
          params: {
            f: 'json',
            where: 'PROJECTID = ' + projectid,
            outFields: '*',
            orderByFields: 'DOCID ASC',
            returnGeometry: false
          }
        };

        return agsServer.ptFs.request(options);
      },

      //Display project with proper engineering firms, document types and sheettypes
      display: function(projectid){
        //Generate promises for display
        var project = this.project(projectid),
            docs = this.documents(projectid);

        return $q.all([project, docs]);
      },

      //Search for a Project by metadata
      projects: function (typed){
        typed = clean4Ags(typed);

        var options = {
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

        return agsServer.ptMs.request(options);

      },

      //Search project by location
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
              deferred.resolve({features: []});
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
        var options = {
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

        return agsServer.streetsMs.request(options);

      },

      //Searches all posible options returns promise when all resolve
      all: function(typed){
        //Generate promises for all search vectors
        var projects = this.projects(typed),
            addresses = this.addresses(typed);
            // permits = this.permits(typed);

        return $q.all([projects, addresses]);

      }


    }; //end search object


    return (search);


  }]);
