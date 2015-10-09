/**
 * DocumentFactory Service
 * @namespace Service/Factory
 * @desc Controls all crud operations for project documents
 */

(function() {
  'use strict';

    angular
      .module('pumprApp')
      .factory('DocumentFactory', DocumentFactory);

      DocumentFactory.$inject = ['agsServer', 'Auth', 'addEngineeringFirm', '$http','$q'];

    function DocumentFactory(agsServer, Auth, addEngineeringFirm, $http, $q) {
      var service = {
        add: add,
        changeDocumentName: changeDocumentName,
        deleteDoc: deleteDoc,
        exists: exists,
        find: find,
        getTables: getTables,
        update: update
      };

      return service;

      /**
      *@type method
      *@access private
      *@name sheetTypes
      *@desc Gets all sheet types
      *@returns {HttpPromise}
      */
      function sheetTypes() {
        var options = {
          layer: 'RPUD.SHEETTYPES',
          actions: 'query',
          timeout: 30000,
          params: {
            f: 'json',
            where: '1 = 1',
            outFields: 'SHEETTYPEID, SHEETTYPE'
          }
        };

        return agsServer.ptFs.request(options);
      }

      /**
      *@type method
      *@access private
      *@name documentTypes
      *@desc Gets all documents types
      *@returns {HttpPromise}
      */
      function documentTypes() {
        var options = {
          layer: 'RPUD.DOCUMENTTYPES',
          actions: 'query',
          timeout: 30000,
          params: {
            f: 'json',
            where: '1 = 1',
            outFields: 'DOCTYPEID, DOCUMENTTYPE'
          }
        };

        return agsServer.ptFs.request(options);
      }

      /**
      *@type method
      *@access public
      *@name find
      *@desc Gets all documents
      *@param {String} doc - The document search string (ex. <projectid>-<doctypeid>-<docid>)
      *@returns {HttpPromise}
      */
      function find(data) {
        return;
      }

      /**
      *@type method
      *@access public
      *@name add
      *@desc Adds document to database
      *@param {Object} data - Attribute data
      *@returns {HttpPromise}
      */
      function add(data){
        var options = {
          layer: 'RPUD.PTK_DOCUMENTS',
          actions: 'addFeatures',
          timeout: 30000,
          params: {
            f: 'json',
            features: [{attributes: data}]
          }
        };
        return agsServer.ptFs.request(options);
      }

      /**
      *@type method
      *@access public
      *@name update
      *@desc Updates document in database
      *@param {Object} data - Attribute data
      *@returns {HttpPromise}
      */
      function update(data) {
        var options;
        //Converts Times
        if(data.SEALDATE !== undefined){
          data.SEALDATE = data.SEALDATE.getTime();
        }
        //Change document name
        if(data.DOCTYPEID !== undefined){
          //Prepare for ArcGIS server
          data = {
            OBJECTID: data.OBJECTID,
            DOCTYPEID: data.DOCTYPEID
          };
        }

        options = {
          layer: 'RPUD.PTK_DOCUMENTS',
          actions: 'updateFeatures',
          timeout: 30000,
          params: {
            f: 'json',
            features: [{attributes: data}]
          }
        };
        return agsServer.ptFs.request(options);
      }

      /**
      *@type method
      *@access public
      *@name changeDocumentName
      *@desc Updates file name on server
      *@param {Object} data - Attribute data
      *@returns {HttpPromise}
      */
      function changeDocumentName(data) {
        var deferred, url, config;
        deferred = $q.defer();
        if (data.EXISTS){
          url = '/api/documents/update/' + data.ORIGINAL;
          config = {
            params: {
              docType: data.DOCTYPEID
            }
          };

          $http.post(url, config)
            .then(function(res){
              deferred.resolve(res);
            })
            .catch(function(err){
              deferred.reject(err);
            });
        }
        else {
          deferred.resolve({exists: false});
        }
        return deferred.promise;
      }

      /**
      *@type method
      *@access public
      *@name deleteDoc
      *@desc Deletes document from server and database
      *@param {Object} data - Attribute data
      *@returns {HttpPromise}
      */
      function deleteDoc(data){
        var options = {
          layer: 'RPUD.PTK_DOCUMENTS',
          actions: 'deleteFeatures',
          timeout: 30000,
          params: {
            f: 'json',
            objectIds: data.objectIds
          }
        };
        return agsServer.ptFs.request(options)
      }

      /**
      *@type method
      *@access public
      *@name getTables
      *@desc Gets all related tables sheet types, engineering firms and document types
      *@returns {HttpPromise}
      */
      function getTables() {
        var eng, docs, sheets;
        eng = addEngineeringFirm.getAll();
        docs = documentTypes();
        sheets = sheetTypes();

        return $q.all([eng, sheets, docs]);
      }

      /**
      *@type method
      *@access public
      *@name deleteDoc
      *@desc Deletes document from server and database
      *@param {Object} data - Attribute data
      *@returns {HttpPromise}
      */
      function exists(filename) {
        var config = {
          params: {
            filename: filename
          }
        };
        return $http.get('/api/documents/exists', config);
      }
    }
})();
