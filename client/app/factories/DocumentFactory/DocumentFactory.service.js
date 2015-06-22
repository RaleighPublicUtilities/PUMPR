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

    // function removeEmptyFields (data) {
    //
    //     for (var a in data){
    //
    //       if(data[a] ===  undefined){
    //         delete data[a];
    //       }
    //       data[a] = data[a] === 'false' ? 0 : data[a] === 'true' ? 1 : data[a];
    //     }
    //
    //     return data;
    // }
    // //Options constructor
    // var Document = function (data){
    //   this.data = {
    //     PROJECTNAME: data.PROJECTNAME,
    //     PROJECTID: data.PROJECTID,
    //     DOCID: data.DOCID || 0,
    //     WATER: data.WATER || 0,
    //     SEWER: data.SEWER || 0,
    //     REUSE: data.REUSE || 0,
    //     STORM: data.STORM || 0,
    //     FORMERNAME: data.FORMERNAME || undefined,
    //     ALIAS: data.ALIAS || undefined,
    //     SEALDATE: data.SEALDATE,
    //     DEVPLANID: data.DEVPLANID,
    //     NOTES: data.NOTES || undefined,
    //     ENGID: data.ENGID || undefined,
    //     DOCTYPEID: data.DOCTYPEID || undefined,
    //     SHEETTYPEID: data.SHEETTYPEID || undefined
    //   };
    //   return this;
    // };
    // Document.prototype = {
    //   setValue: function (info){
    //     angular.extend(this.data, info);
    //     return this;
    //   },
    //   getData: function (){
    //     return this.data;
    //   },
    //   postNewDoc: function (){
    //     var that = this;
    //     var copy = {};
    //     angular.copy(that.data, copy);
    //     copy = removeEmptyFields(copy);
    //       var options = {
    //           layer: 'RPUD.PTK_DOCUMENTS',
    //           actions: 'addFeatures',
    //           params: {
    //             f: 'json',
    //             features: [{attributes: copy}]
    //           }
    //         };
    //
    //     agsServer.ptFs.request(options)
    //       .then(function(data){
    //         if (data.error){
    //           console.log(data.error);
    //         }
    //         else{
    //
    //           that.setValue({OBJECTID: data.addResults[0].objectId});
    //         }
    //       },
    //       function(err){
    //         console.log(err);
    //       });
    //   },
    //   updateDoc: function (){
    //     //Converts Times
    //     if(this.data.SEALDATE !== undefined){
    //       this.data.SEALDATE = this.data.SEALDATE.getTime();
    //     }
    //     //Removes faslsy values
    //     for (var _k in this.data){
    //       this.data[_k] ? this.data : delete this.data[_k];
    //     }
    //
    //     console.log('Updated: ' + this.data.OBJECTID);
    //
    //       var options = {
    //           layer: 'RPUD.PTK_DOCUMENTS',
    //           actions: 'updateFeatures',
    //           params: {
    //             f: 'json',
    //             features: [{attributes: this.data}]
    //           }
    //         };
    //
    //     return agsServer.ptFs.request(options);
    //   },
    //   deleteDoc: function (){
    //
    //     var options = {
    //         layer: 'RPUD.PTK_DOCUMENTS',
    //         actions: 'deleteFeatures',
    //         params: {
    //           f: 'json',
    //           objectIds: this.data.objectIds
    //         }
    //       };
    //
    //     agsServer.ptFs.request(options)
    //       .then(function(data){
    //         if (data.error){
    //           console.log(data.error);
    //         }
    //         else{
    //           console.log('Deleted: ', data);
    //         }
    //       },
    //       function(err){
    //         console.log(err);
    //       });
    //   }
    // };
    return (Document);
  }]);
