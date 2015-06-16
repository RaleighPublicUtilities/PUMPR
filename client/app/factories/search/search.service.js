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

    //Converts utilities boolean from 0 - 1 to ture - false
    function convertUtilities (data){
      var utils = ['WATER', 'SEWER', 'REUSE', 'STORM'];
      utils.forEach(function(util){
        data[util] = data[util] ? true : false;
      });
      return data;
    }

    //Remove null values from results
    function removeEmptyFields (data) {
        for (var a in data){
          data[a] === 'Null' | null | '' | NaN ? delete data[a] : data[a];
        }
        return data;
      }

    //Joins tables together based on field
    //addFieldFromTable(table1, table2, joinField, addFiedl);
    function addFieldFromTable (t1, t2, joinField, addField){
       t1.map(function(t1Data){
         t2.forEach(function(t2Data){
           t1Data.attributes[addField] =  t1Data.attributes[joinField] === t2Data.attributes[joinField] ? t2Data.attributes[addField] : t1Data.attributes[addField];
         });
         convertUtilities(t1Data.attributes);
       });
       return t1;
   }

   //Get all helper tables to create view of doucments with real names
   function getSupportTables (data){
     var deferred = $q.defer();
     var supportTables = [
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

      supportTables.forEach(function(table){
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
          addFieldFromTable(data, table.data, table.joinField, table.addField);
        })
        .catch(function(err){
          deferred.reject(err);
        });
        deferred.resolve(data);
      }); //End loop

      return deferred.promise;

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

      //Get details on a single document
      getDocument: function (docid){
        docid = docid.split('-');
        var options = {
          layer: 'RPUD.PTK_DOCUMENTS',
          actions: 'query',
          params: {
            f: 'json',
            where: 'PROJECTID = ' + docid[0] + " AND DOCTYPEID = '" + docid[1] + "' AND DOCID = " + docid[2],
            outFields: 'DOCID, WATER, SEWER, REUSE, STORM, PROJECTNAME, FORMERNAME, ALIAS, ENGID, DOCTYPEID, SHEETTYPEID',
            returnGeometry: false
          }
        };

        return agsServer.ptFs.request(options);
      },

      //Find all documents for a single project
      documents: function (projectid){
        var deferred = $q.defer();
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

        agsServer.ptFs.request(options)
        .then(function(documents){
          deferred.resolve(getSupportTables(documents.features));
        })
        .catch(function(err){
          deferred.reject(err);
        });

        return deferred.promise;

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
        var deferred = $q.defer();
        typed = clean4Ags(typed);

          var addressOptions  = {
              f: 'json',
              address: typed,
              outSR: 4326,
              outFields: '*',
              returnGeometry: true,
              maxLocations: 5
          };

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

      //Find documents by facilityid
      facilityid: function (typed){
        var sewerfids = [
          {
            tag: 'SNS',
            name: 'Sewer Pump Stations'
          },
          {
            tag: 'SMH',
            name: 'Sewer Manhole'
          },
          {
            tag: 'SFMN',
            name: 'Force Main'
          },
          {
            tag: 'SGMN',
            name: 'Gravity Sewer'
          },
          {
            tag: 'SLAT',
            name: 'Lateral'
          }
        ];

        var waterfids = [
          {
            tag: 'WHYD',
            name: 'Water Hydrants'
          },
          {
            tag: 'WSV',
            name: 'Water System Valves'
          },
          {
            tag: 'WFIT',
            name: 'Water Fittings'
          },
          {
            tag: 'WSC',
            name: 'Water Service Connections'
          },
          {
            tag: 'WSS',
            name: 'Water Sampling Stations'
          },
          {
            tag: 'WCV',
            name: 'Water Control Valves'
          },
          {
            tag: 'WNS',
            name: 'Water Network Structures'
          },
          {
            tag: 'WMN',
            name: 'Water Pressure Mains'
          },
          {
            tag: 'WGM',
            name: 'Water Gravity Mains'
          },
          {
            tag: 'WLAT',
            name: 'Water Lateral Lines'
          },
        ];

        sewerfids.forEach(function(item){
            
        });
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
