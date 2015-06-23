'use strict';

angular.module('pumprApp')
  .factory('DocumentFactory', ['agsServer', 'Auth', 'addEngineeringFirm', '$http','$q', function(agsServer, Auth, addEngineeringFirm, $http, $q){

    function sheetTypes () {
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

    function documentTypes () {
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



    //Creates cache to store touch documents
    var Document = {
      //Find All
      find: function (data){

      },
      add: function (data){
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
      },
      update: function (data){

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

        var options = {
          layer: 'RPUD.PTK_DOCUMENTS',
          actions: 'updateFeatures',
          timeout: 30000,
          params: {
            f: 'json',
            features: [{attributes: data}]
          }
        };

        return agsServer.ptFs.request(options);

        },
        //Changes document name
        changeDocumentName: function (data){
          var deferred = $q.defer();
            if (data.EXISTS){
              var url = '/api/documents/update/' + data.ORIGINAL;
              var config = {
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
            else{
              deferred.resolve({exists: false});
            }
            return deferred.promise;
        },
        //Delete data
        delete: function (data){
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
        },
        getTables: function (){
          var eng = addEngineeringFirm.getAll(),
              docs = documentTypes(),
              sheets = sheetTypes();

          return $q.all([eng, sheets, docs]);
        },
        exists: function (filename){
          var config = {
            params: {
              filename: filename
            }
          };
          return $http.get('/api/documents/exists', config);
        }

      };


    return (Document);
  }]);
