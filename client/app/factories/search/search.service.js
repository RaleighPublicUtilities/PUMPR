'use strict';

angular.module('pumprApp')
  .factory('search', ['agsServer', '$q', '$interval', '$http', 'facilityIdFactory', function (agsServer, $q, $interval, $http, facilityIdFactory) {
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
    function createBuffer(data){
      var deferred = $q.defer();
      var fc, features, arcgisMultipolygon;

        if (Array.isArray(data)){
        features = data.map(function(item){

          var rObj = turf.point([item.location.x, item.location.y], item),
              buffered = turf.buffer(rObj, 0.25, 'miles');
              return buffered.features[0];
        });
        fc = turf.featurecollection(features);
        arcgisMultipolygon = Terraformer.ArcGIS.convert(fc);
        var output = {buffer: arcgisMultipolygon, addresses: data};
        deferred.resolve(output)
      }
      else {
        deferred.resolve([])
      }
      return deferred.promise;
      }

    //Takes esri json multipolygon and returns projects that intersect
    function projectIntersect (data){
      var deferred = $q.defer();
      if ((data.buffer && Array.isArray(data.buffer) && data.buffer.length > 0 ) || (data.points && Array.isArray(data.points.features) && data.points.features.length > 0)){
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
            inSR: 4326
          }
        };

         projectOptions.params.geometryType = (data.points && data.points.geometryType) ? data.points.geometryType : 'esriGeometryPolygon';
         projectOptions.params.geometry = (data.points && data.points.features) ? data.points.features[0].geometry : data.buffer[0].geometry;

         agsServer.ptMs.request(projectOptions)
          .then(function(res){
            if (data.addresses){
              deferred.resolve({projects: res, addresses: data.addresses});
            }
            else {
              deferred.resolve({projects: res, facid: data.facid});
            }
          })
          .catch(function(err){
            deferred.resolve(data.addresses || data.facid)
          })
      }
      else {
        deferred.resolve(data.addresses || data.facid)
      }
      return deferred.promise;
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


   function getAddresses (data){
     var addresses;
      var deferred = $q.defer();
     if (Array.isArray(data.candidates) && data.candidates.length > 0){
       addresses = data.candidates.map(function(a){
         return {group: 'address', name: a.address, location: a.location}
       });
       deferred.resolve(addresses);
     }
     else{
       deferred.resolve([]);
     }
     return deferred.promise;
   }

   function getProjectByAddress (data){
     var deferred = $q.defer();
       createBuffer(data)
        .then(projectIntersect)
        .then(function(info){
          deferred.resolve(info);
        })
        .catch(function(err){
          deferred.reject([]);
        })
     return deferred.promise;
   }

   function combineAddressProjectArray (res){
     var deferred = $q.defer();
     if (res.projects && Array.isArray(res.projects.features) && res.projects.features.length > 0){
       var projects = res.projects.features.map(function(f){
         return {group: 'project', name: f.attributes.PROJECTNAME + ':' + f.attributes.DEVPLANID + ':' + f.attributes.PROJECTID}
       });
       projects = projects.splice(0,5);
       res.addresses = res.addresses.splice(0,5);
       deferred.resolve(projects.concat(res.addresses));
     }
     else {
       deferred.resolve(res.addresses || []);
     }

     return deferred.promise;
   }

   function setFacilityIdsServer (typed){
     var deferred = $q.defer(),
         typed = clean4Ags(typed),
         facidList, len, i;

     if (typed.length > 4 && (typed[0] === 'S' || typed[0] === 'W')){
       facidList = typed[0] === 'S' ? facilityIdFactory.sfids : facilityIdFactory.wfids;
       len = facidList.length;
       for (i = 0; i < len; i++){
         if (typed.search(facidList[i].tag) === 0){
           facidList = facidList[i]
           break;
         }
       }
       if (!Array.isArray(facidList)){
         deferred.resolve({facidList: facidList, typed: typed});
      }
    }
    else {
      deferred.resolve([]);
    }
    return deferred.promise;
   }

   function getFacids (inData){
     var deferred = $q.defer(), options;
     if (Array.isArray(inData) && inData.length === 0){
       deferred.resolve([]);
     }
     else{

       options = {
           geojson: false,
           actions: 'query',
           params: {
             f: 'json',
             outFields: 'FACILITYID',
             where: "FACILITYID like '%" + inData.typed + "%'",
             returnGeometry: true,
             orderByFields: 'FACILITYID ASC',
             outSR: 4326
           }
         };

         options.layer = inData.facidList.name;
         agsServer[inData.facidList.server].request(options)
           .then(function(data){

             if (Array.isArray(data.features) && data.features.length === 0){
               deferred.resolve([]);
             }
             else{
               var facilityids = data.features.map(function(f){
                 return {group: 'facilityid', name: f.attributes.FACILITYID, location: f.geometry}
               })
               deferred.resolve({points: data, facid: facilityids});
             }
           })
           .catch(function(err){
             deferred.resolve([]);
           })
         }

     return deferred.promise;
   }

   function combineFacidsProjectsArray (res) {
     var deferred = $q.defer();
     if (res === undefined || (Array.isArray(res) && res.length === 0)){
       deferred.resolve([]);
     }
     else{
       if (res.projects && Array.isArray(res.projects.features) && res.projects.features.length > 0){
         var projects = res.projects.features.map(function(f){
           return {group: 'project', name: f.attributes.PROJECTNAME + ':' + f.attributes.DEVPLANID + ':' + f.attributes.PROJECTID}
         });
         projects = projects.splice(0,5);
         res.facid = res.facid.splice(0,5);
         deferred.resolve(projects.concat(res.facid));
       }
       else {
         deferred.resolve(res.facid || []);
       }
     }
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
        var deferred = $q.defer();
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

        agsServer.ptMs.request(options)
          .then(function(res){
            var filter = res.features.map(function(f){
              return {group: 'project', name: f.attributes.PROJECTNAME + ':' + f.attributes.DEVPLANID + ':' + f.attributes.PROJECTID}
            });
            filter = filter.splice(0,5);
            deferred.resolve(filter);
          })
          .catch(function(err) {
            deffer.reject(err);
          });
        return deferred.promise;

      },

      //Search project by location
      addresses: function(typed){
        var deferred = $q.defer();
        var addresses, filter;
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
          .then(getAddresses)
          .then(getProjectByAddress)
          .then(combineAddressProjectArray)
          .then(function(data){
            deferred.resolve(data);
          })
          .catch(function(err){
            deferred.reject('Address:',err);
          });

          return deferred.promise;

      },

      //Find documents by facilityid
      facilityids: function (typed){

        var deferred = $q.defer();

        setFacilityIdsServer(typed)
              .then(getFacids)
              .then(projectIntersect)
              .then(combineFacidsProjectsArray)
              .then(function(data){
                deferred.resolve(data);
              })
              .catch(function(err){
                deferred.reject('Facid:', err);
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

      //Gets itpipes date for a given sewer gravity main or force main
      itpipes: function (facid){

        var req = {
          method: 'GET',
          url: '/api/itpipes',
          params: { id: facid }
        };

        return $http(req);

      },

      //Searches all posible options returns promise when all resolve
      all: function(typed){
        //Generate promises for all search vectors
        var projects = this.projects(typed),
            addresses = this.addresses(typed),
            // permits = this.permits(typed);
            facilityids = this.facilityids(typed);

        return $q.all([projects, addresses, facilityids]);

      }


    }; //end search object


    return (search);


  }]);
