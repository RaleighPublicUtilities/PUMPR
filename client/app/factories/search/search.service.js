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

    //Takes esri point json and coverts it to multipoint
    // function geomConversion(data, callback){
    //   var geom, geomType, wkid, output, outgeom;
    //   geom = data.features;
    //   geomType = data.geometryType;
    //   wkid = data.spatialReference.wkid,
    //   output = {
    //     spatialReference:{wkid : wkid}
    //   };
    //
    //   switch(geomType){
    //     case 'esriGeometryPoint':
    //       outgeom = geom[0].geometry;
    //       output.points = outgeom;
    //       break;
    //     case 'esriGeometryPolyline':
    //       outgeom = geom[0].geometry;
    //       output.paths = outgeom.paths;
    //       break;
    //     default:
    //       callback(output, geomType);
    //   }
    //   callback(output, geomType);
    // }


    //Takes esri json multipolygon and returns projects that intersect
    function projectIntersect (data, geomType){
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
          geometryType: geomType,
          geometry: data
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
                projectIntersect(buffer[0].geometry, 'esriGeometryPolygon')
                  .then(function(res){
                    deferred.resolve(res);
                  })
                  .catch(function(err){
                    deffer.reject(err);
                  });

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
      facilityids: function (typed){
        var layer, facidList, wfids, sfids, options, i, len;
        var deferred = $q.defer();
        typed = clean4Ags(typed);

        options = {
          geojson: false,
          actions: 'query',
          params: {
            f: 'json',
            outFields: 'FACILITYID',
            where: "FACILITYID like '%" +typed + "%'",
            returnGeometry: true,
            orderByFields: 'FACILITYID ASC',
            outSR: 4326
          }
        };


        wfids = [
          {
            tag: /(WHYD)\d*/,
            name: 'Water Hydrants',
            server: 'waterMs'
          },
          {
            tag: /(WSV)\d*/,
            name: 'Water System Valves',
            server: 'waterMs'
          },
          {
            tag: /(WFIT)\d*/,
            name: 'Water Fittings',
            server: 'waterMs'
          },
          {
            tag: /(WSC)\d*/,
            name: 'Water Service Connections',
            server: 'waterMs'
          },
          {
            tag: /(WSS)\d*/,
            name: 'Water Sampling Stations',
            server: 'waterMs'
          },
          {
            tag: /(WCV)\d*/,
            name: 'Water Control Valves',
            server: 'waterMs'
          },
          {
            tag: /(WNS)\d*/,
            name: 'Water Network Structures',
            server: 'waterMs'
          },
          {
            tag: /(WMN)\d*/,
            name: 'Water Pressure Mains',
            server: 'waterMs'
          },
          {
            tag: /(WGM)\d*/,
            name: 'Water Gravity Mains',
            server: 'waterMs'
          },
          {
            tag: /(WLAT)\d*/,
            name: 'Water Lateral Lines',
            server: 'waterMs'
          }
        ];

        sfids = [
          {
            tag: /(SNS)\d{4}/,
            name: 'Sewer Pump Stations',
            server: 'sewerMs'
          },
          {
            tag: /(SMH)\d{6}/,
            name: 'Sewer Manhole',
            server: 'sewerMs'
          },
          {
            tag: /(SFMN)\d{5}/,
            name: 'Force Main',
            server: 'sewerMs'
          },
          {
            tag: /(SGMN)\d{6}/,
            name: 'Gravity Sewer',
            server: 'sewerMs'
          },
          {
            tag: /(SLAT)\d{6}/,
            name: 'Lateral',
            server: 'sewerMs'
          }
        ];

        //
        if (typed.length > 6 && (typed[0] === 'S' || typed[0] === 'W')){
          facidList = typed[0] === 'S' ? sfids : wfids;
          len = facidList.length;
          for (i = 0; i < len; i++){
            if (typed.search(facidList[i].tag) === 0){
              var facidList = facidList[i]
              break;
            }
          }
          if (!Array.isArray(facidList)){
            options.layer = facidList.name;
            agsServer[facidList.server].request(options)
              .then(function(data){

                if (data.features.length === 0){
                  deferred.resolve({features: []});
                }
                else{
                  projectIntersect(data.features[0].geometry, data.geometryType)
                    .then(function(res){
                      deferred.resolve(res);
                    })
                    .catch(function(err){
                      deferred.reject(err);
                    });
                }

              })
              .catch(function(err){
                deferred.reject(err);
              });
            }
            else {
              deferred.resolve({features: []});
            }
        }
        else{
          deferred.resolve({features: []});
        }
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
            addresses = this.addresses(typed),
            // permits = this.permits(typed);
            facilityids = this.facilityids(typed);

        return $q.all([projects, addresses, facilityids]);

      }


    }; //end search object


    return (search);


  }]);
