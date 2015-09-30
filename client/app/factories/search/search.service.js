(function(){
  'use strict';

  angular
    .module('pumprApp')
    .factory('search', search);

    search.$inject = ['agsServer', '$q', '$interval', '$http', 'facilityIdFactory'];

    function search(agsServer, $q, $interval, $http, facilityIdFactory) {

      var service = {
        addresses: addresses,
        all: all,
        display: display,
        documents: documents,
        getDocument: getDocument,
        itpipes: itpipes,
        street: street,
        permits: permits,
        project: project,
        projects: projects,
        facilityids: facilityids
      };

      return service;

      /**
      *@type method
      *@access public
      *@name project
      *@desc Querys a single project from database by its project id
      *@param {Number} projectid
      *@returns {HttpPromise}
      */
      function project(projectid) {

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

      }

      /**
      *@type method
      *@access public
      *@name getDocument
      *@desc Get details on a single document
      *@param {String} doc - The document search string (ex. <projectid>-<doctypeid>-<docid>)
      *@returns {HttpPromise}
      */
      function getDocument(docid) {
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
      }

      /**
      *@type method
      *@access public
      *@name documents
      *@desc Find all documents for a single project
      *@param {Number} projectid
      *@returns {HttpPromise}
      */
      function documents(projectid) {
        var deferred, options;

        deferred = $q.defer();
        options = {
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

      }

      /**
      *@type method
      *@access public
      *@name display
      *@desc Display view for project with aliases for engineering firms, document types and sheettypes
      *@param {Number} projectid
      *@returns {HttpPromise}
      */
      function display(projectid) {
        var project, docs;
        project = this.project(projectid);
        docs = this.documents(projectid);

        return $q.all([project, docs]);
      }

      /**
      *@type method
      *@access public
      *@name display
      *@desc Search for project by name, development plan id, project id, alias or formername
      *@param {String} typed - Project Identifier
      *@returns {HttpPromise}
      */
      function projects(typed) {
        var deferred, options;
        deferred = $q.defer();
        typed = clean4Ags(typed);

        options = {
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
            deferred.resolve(projectFilter(res.features));
          })
          .catch(function(err) {
            deferred.reject(err);
          });

        return deferred.promise;

        function projectFilter(features) {
          var filter;
          filter = features.map(function(f){
            f = f.attributes;
            return {group: 'project', name: f.PROJECTNAME + ':' + f.DEVPLANID + ':' + f.PROJECTID};
          });
          filter = filter.splice(0,5);
          return filter;
        }

      }

      /**
      *@type method
      *@access public
      *@name addresses
      *@desc Search for project or address by address
      *@param {String} typed - Full Address
      *@returns {HttpPromise}
      */
      function addresses(typed) {
        var deferred, addresses, filter, addressOptions;

        deferred = $q.defer();
        typed = clean4Ags(typed);

        addressOptions  = {
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

      }

      /**
      *@type method
      *@access public
      *@name facilityids
      *@desc Find documents by facilityid
      *@param {String} typed - Facility ID
      *@returns {HttpPromise}
      */
      function facilityids(typed) {

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

      }

      /**
      *@todo This method is not implemented
      *@type method
      *@access public
      *@name street
      *@desc Lookup project by permit #
      *@param {String} permitNum - permit number
      *@returns {HttpPromise}
      */
      function permits(permitNum) {
        return;
      }

      /**
      *@type method
      *@access public
      *@name street
      *@desc Lookup address
      *@param {String} typed - Address
      *@returns {HttpPromise}
      */
      function street(typed) {
        var options;
        typed = clean4Ags(typed);

        options = {
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

      }

      /**
      *@type method
      *@access public
      *@name itpipes
      *@desc Gets itpipes data for a given sewer gravity main or force main
      *@param {String} facid - Facility ID
      *@returns {HttpPromise}
      */
      function itpipes(facid) {
        var req = {
          method: 'GET',
          url: '/api/itpipes',
          params: { id: facid }
        };
        return $http(req);
      }

      /**
      *@type method
      *@access public
      *@name all
      *@desc Searches projects, addresses and facility ids
      *@param {String} typed - Any search term
      *@returns {HttpPromise}
      */
      function all(typed) {
        var projects = this.projects(typed),
            addresses = this.addresses(typed),
            // permits = this.permits(typed);
            facilityids = this.facilityids(typed);

        return $q.all([projects, addresses, facilityids]);

      }

      /**
      *@type method
      *@access private
      *@name clean4Ags
      *@desc Clean data before searching in ArcGIS Server
      *@param {String} typed - Any search term
      *@returns {String}
      */
      function clean4Ags(typed) {
        typed = typed.toUpperCase();
        //Allows apostrophe (single quote) to be searched
        typed = typed.replace("'", "''");
        return typed;
      }

      /**
      *@type method
      *@access private
      *@name createBuffer
      *@desc Takes array of addresses and buffers results by 0.25 mile returns esri json multipolygon
      *@param {Array} data - Array of addresses
      *@returns {HttpPromise}
      */
      function createBuffer(data) {
        var deferred, fc, features, arcgisMultipolygon, rObj, buffered, output;
        deferred = $q.defer();

        if (Array.isArray(data)){
          features = data.map(function(item){
            rObj = turf.point([item.location.x, item.location.y], item);
            buffered = turf.buffer(rObj, 0.25, 'miles');
            return buffered.features[0];
          });
          fc = turf.featurecollection(features);
          arcgisMultipolygon = Terraformer.ArcGIS.convert(fc);
          output = {buffer: arcgisMultipolygon, addresses: data};
          deferred.resolve(output);
        }
        else {
          deferred.resolve([]);
        }
        return deferred.promise;
      }

      /**
      *@type method
      *@access private
      *@name projectIntersect
      *@desc Takes esri json multipolygon and returns projects that intersect
      *@param {Array} data - Array of addresses
      *@returns {HttpPromise}
      */
      function projectIntersect(data) {
        var deferred, points, options;
        deferred = $q.defer();
        points = data.points;
        if ((data.buffer && Array.isArray(data.buffer) && data.buffer.length > 0 ) || (points && Array.isArray(points.features) && points.features.length > 0)){
          options = {
            layer: 'Project Tracking',
            geojson: false,
            actions: 'query',
            params: {
              f: 'json',
              outFields: 'PROJECTNAME,DEVPLANID,PROJECTID',
              where: '1=1',
              returnGeometry: false,
              orderByFields: 'PROJECTNAME ASC',
              inSR: 4326
            }
          };

           options.params.geometryType = (points && points.geometryType) ? points.geometryType : 'esriGeometryPolygon';
           options.params.geometry = (points && points.features) ? points.features[0].geometry : data.buffer[0].geometry;

           agsServer.ptMs.request(options)
            .then(function(res){
              if (data.addresses){
                deferred.resolve({projects: res, addresses: data.addresses});
              }
              else {
                deferred.resolve({projects: res, facid: data.facid});
              }
            })
            .catch(function(err){
              deferred.resolve(data.addresses || data.facid);
            });
        }
        else {
          deferred.resolve(data.addresses || data.facid);
        }
        return deferred.promise;
      }

      /**
      *@type method
      *@access private
      *@name convertUtilities
      *@desc onverts utilities boolean from 0 - 1 to ture - false
      *@param {Array} data - List of projects or documents
      *@returns {Array}
      */
      function convertUtilities(data) {
        var utils = ['WATER', 'SEWER', 'REUSE', 'STORM'];
        utils.forEach(function(util){
          data[util] = data[util] ? true : false;
        });
        return data;
      }

      /**
      *@type method
      *@access private
      *@name removeEmptyFields
      *@desc Removes blacklisted key/value pairs from object
      *@param {Object} data - Form data
      *@returns {Object}
      */
      function removeEmptyFields(data) {
        var a;
        for (a in data){
          if (findfalsy(data[a])){
            delete data[a];
          }
        }
        return data;

        function findfalsy(value) {
          var blacklist = ['Null', null, '', NaN, undefined];
          blacklist.some(function(element){
            return value === element;
          });
         }
      }

      /**
      *@type method
      *@access private
      *@name addFieldFromTable
      *@desc Adds field from on array of objects to another based on an object key
      *@param {Array} t1 - Data from first table
      *@param {Array} t2 - Data from second table
      *@param {String} joinField - Key objects will be joined by
      *@param {String} addField - New key to be added to t1
      *@returns {Array}
      */
      function addFieldFromTable(t1, t2, joinField, addField) {
         t1.map(function(table1){
           table1 = table1.attributes;
           t2.forEach(function(table2){
             table2 = table2.attributes;
             table1[addField] =  table1[joinField] === table2[joinField] ? table2[addField] : table1[addField];
           });
           convertUtilities(table1);
         });
         return t1;
      }

      /**
      *@type method
      *@access private
      *@name getSupportTables
      *@desc Get helper tables to create view of doucments with real names
      *@param {Array} data - Data from documents
      *@returns {Object}
      */
      function getSupportTables(data) {
        var supportTables, deferred;
        deferred = $q.defer();
        supportTables = [
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
          var name, options;
          name = table.name;

          options = {
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
          agsServer.ptFs.request(options)
            .then(function(d){
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

      /**
      *@type method
      *@access private
      *@name getAddresses
      *@desc Prepares address data for grouped search results
      *@param {Object} data - Address candidates returned form server
      *@returns {HttpPromise}
      */
      function getAddresses(data) {
        var addresses, deferred;
        deferred = $q.defer();
        if (Array.isArray(data.candidates) && data.candidates.length > 0){
          addresses = data.candidates.map(function(a){
            return {group: 'address', name: a.address, location: a.location};
          });
          deferred.resolve(addresses);
        }
        else{
          deferred.resolve([]);
        }
        return deferred.promise;
      }

      /**
      *@type method
      *@access private
      *@name getProjectByAddress
      *@desc Gets nearby projects by address
      *@param {Array} data - Array of addresses
      *@returns {HttpPromise}
      */
      function getProjectByAddress(data) {
        var deferred = $q.defer();

        createBuffer(data)
          .then(projectIntersect)
          .then(function(info){
            deferred.resolve(info);
          })
          .catch(function(err){
            deferred.reject([]);
          });
        return deferred.promise;
      }

      /**
      *@type method
      *@access private
      *@name combineAddressProjectArray
      *@desc Combines project and address arrays from grouped search
      *@param {Object} res - Object containing project and address arrays
      *@returns {HttpPromise}
      */
      function combineAddressProjectArray(res) {
        var projects, deferred;
        deferred = $q.defer();
        if (res.projects && Array.isArray(res.projects.features) && res.projects.features.length > 0){
          projects = res.projects.features.map(function(f){
            return {group: 'project', name: f.attributes.PROJECTNAME + ':' + f.attributes.DEVPLANID + ':' + f.attributes.PROJECTID};
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

      /**
      *@type method
      *@access private
      *@name setFacilityIdsServer
      *@desc Determines which feature service facility id belongs too
      *@param {String} typed - Facility ID
      *@returns {HttpPromise}
      */
      function setFacilityIdsServer(typed) {
        var facidList, len, i, deferred = $q.defer();
        typed = clean4Ags(typed);

        if (typed.length > 4 && (typed[0] === 'S' || typed[0] === 'W')){
          facidList = typed[0] === 'S' ? facilityIdFactory.sfids : facilityIdFactory.wfids;
          len = facidList.length;
          for (i = 0; i < len; i++){
            if (typed.search(facidList[i].tag) === 0){
              facidList = facidList[i];
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

      /**
      *@type method
      *@access private
      *@name getFacids
      *@desc Query's feature service for facilityid
      *@param {String} inData
      *@returns {HttpPromise}
      */
      function getFacids(inData) {
        var deferred = $q.defer(), options;
        if (Array.isArray(inData) && inData.length === 0){
          deferred.resolve([]);
        }
        else {
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
                  return {group: 'facilityid', name: f.attributes.FACILITYID, location: f.geometry};
                });
                deferred.resolve({points: data, facid: facilityids});
              }
            })
            .catch(function(err){
              deferred.resolve([]);
            });
        }
        return deferred.promise;
      }

      /**
      *@type method
      *@access private
      *@name combineFacidsProjectsArray
      *@desc Combines facilityids and project arrays for group display
      *@param {Object} res - Contains project and facilityid arrays
      *@returns {HttpPromise}
      */
      function combineFacidsProjectsArray(res) {
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

    }
    
})();
