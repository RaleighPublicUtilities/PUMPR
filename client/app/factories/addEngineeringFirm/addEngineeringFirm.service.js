(function(){
  'use strict';

  angular
    .module('pumprApp')
    .factory('addEngineeringFirm', addEngineeringFirm);

    addEngineeringFirm.$inject = ['agsServer'];

  function addEngineeringFirm(agsServer) {

    var service = {
      checkId: checkId,
      find: find,
      findOne: findOne,
      generateId: generateId,
      getAll: getAll,
      getList: getList,
      setTable: setTable,
    };

    return service;

    /**
    *@type method
    *@access public
    *@name generateId
    *@desc Checks in generated ENGID is already in use reuturns ture/false
    *@param {String} engid - Engineering firm id
    *@returns {Callback}
    */
    function checkId(engid, cb){
      var that = this;
      var options;
      if (typeof engid === 'object' || engid === ''){
        cb({error: 'Please Enter String'});
      }
      else{
        options = {
          layer: 'RPUD.ENGINEERINGFIRM',
          actions: 'query',
          params: {
            f: 'json',
            where: "ENGID = '" + engid + "'",
            outFields: 'ENGID'
          }
        };

        agsServer.ptFs.request(options)
          .then(function(data) {
            if (data.features.length === 0){
              return cb(engid);
            }
            else {
              engid+=engid.charAt(0);
              that.checkId(engid, function(a){
                return cb(a);
              });
            }
          })
          .catch(function(err) {
            return cb(err, null);
          });
        }
    }

    /**
    *@type method
    *@access public
    *@name find
    *@desc Gets all engineering firms with Ids like search variable
    *@param {String} engid - Engineering firm id
    *@returns {HttpPromise}
    */
    function find(engid) {
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
    }

    /**
    *@type method
    *@access public
    *@name findOne
    *@desc Gets an engineering firms by engid
    *@param {String} engid - Engineering firm id
    *@returns {HttpPromise}
    */
    function findOne(engid) {
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
    }

    /**
    *@type method
    *@access public
    *@name generateId
    *@desc Generates new ENGID by taking the first letter of each word and concat them, adds next letter to resolve conflicts
    *@param {Array} data - List of engineering firm data
    *@returns {Callback}
    */
    function generateId(data, cb) {
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
    }

    /**
    *@type method
    *@access public
    *@name getAll
    *@desc Gets all engineering firms
    *@returns {HttpPromise}
    */
    function getAll() {
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
    }

    /**
    *@type method
    *@access public
    *@name getList
    *@desc Gets a group of engineering firms by engid
    *@param {Array} list - Array of engineering firms
    *@returns {HttpPromise}
    */
    function getList(list) {
      var sql, options, len;
      if(Array.isArray(list) && list.length){
        sql = '';
        len = list.length - 1;
        list.forEach(function(item, index){
          if (index < len){
            sql+="ENGID = '" + item + "' OR ";
          }
          else {
            sql+="ENGID = '" + item + "'";
          }
        });
      }

      options = {
        layer: 'RPUD.ENGINEERINGFIRM',
        actions: 'query',
        params: {
          f: 'json',
          where: sql,
          outFields: '*'
        }
      };
      return agsServer.ptFs.request(options);
    }

    /**
    *@type method
    *@access public
    *@name setTable
    *@desc Prepares table to show engineering firm data
    *@param {Array} data - Engineering firm data
    *@returns {Callback}
    */
    function setTable(data, cb) {
      var outData = [];
      data.forEach(function(record){
        outData.push(record.attributes);
      });
      cb(outData);
    }

    
  }
})();
