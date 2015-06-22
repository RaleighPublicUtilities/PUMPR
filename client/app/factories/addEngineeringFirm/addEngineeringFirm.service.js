'use strict';

angular.module('pumprApp')
  .factory('addEngineeringFirm', function (agsServer) {
    // Service logic
    // ...


    // Public API here
    return {
      getAll: function () {
        var options = {
          layer: 'RPUD.ENGINEERINGFIRM',
          actions: 'query',
          params: {
            f: 'json',
            where: '1 = 1',
            outFields: 'ENGID, FULLNAME, SIMPLIFIEDNAME'
          }
        };

        return agsServer.ptFs.request(options);
      },

      find: function (search) {

        var options = {
          layer: 'RPUD.ENGINEERINGFIRM',
          actions: 'query',
          params: {
            f: 'json',
            where: "ENGID LIKE '%" + search + "%'",
            outFields: 'ENGID, FULLNAME, SIMPLIFIEDNAME'
          }
        };
        return agsServer.ptFs.request(options);
      },

      findOne: function (search) {

        var options = {
          layer: 'RPUD.ENGINEERINGFIRM',
          actions: 'query',
          params: {
            f: 'json',
            where: "ENGID = '" + search + "'",
            outFields: '*'
          }
        };
        return agsServer.ptFs.request(options);
      },

      setTable: function (data, cb){
        var outData = [];
        data.forEach(function(record){
          outData.push(record.attributes);
        });

        cb(outData);
      },

      //Generates new ENGID by taking the first letter of each word and concat them, adds next letter to resolve conflicts
      generateId: function (eng, cb){
        var engid = '';
        var whiteList = /[A-Z]/;
        if (typeof eng === 'string'){
          eng = eng.toUpperCase();
          eng = eng.trim().split(' ');
          eng.forEach(function(item){
            if(whiteList.test(item.charAt(0))){
              engid+=item.charAt(0);
            }
          });
           cb(engid);
        }
        else{
         cb({error: 'Please Enter String'});
        }
      },

      //Checks in generated ENGID is already in use reuturns ture/false
      checkId: function (engid, cb){
        var that = this;
        if (typeof engid === 'object' || engid === ''){
          cb({error: 'Please Enter String'});
        }
        else{
          var options = {
            layer: 'RPUD.ENGINEERINGFIRM',
            actions: 'query',
            params: {
              f: 'json',
              where: "ENGID = '" + engid + "'",
              outFields: 'ENGID'
            }
          };

            agsServer.ptFs.request(options).then(function(data){
              if (data.features.length === 0){
                cb(engid);
              }
              else {
                engid+=engid.charAt(0);
                that.checkId(engid, function(a){
                  cb(a);
                });
              }
            }, function(err){
              console.log(err);
              cb(engid);
            });
        }


      },



    };
  });
