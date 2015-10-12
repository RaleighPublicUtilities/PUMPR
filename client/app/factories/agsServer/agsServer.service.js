/**
 * agsServer Service
 * @namespace Service/Factory
 * @desc Config connections to ArcGIS Server
 */

(function(){
  'use strict';
    angular
      .module('pumprApp')
      .factory('agsServer', agsServer);

      agsServer.$inject = ['Ags', '$q', '$http'];

    function agsServer(Ags, $q, $http) {
      //Create Server objects
      var dev = new Ags({host: 'geodevapplv1:6080'});
      var gis = new Ags({host: 'gis.raleighnc.gov'});
      var maps = new Ags({host: 'maps.raleighnc.gov'});
      var mapstest = new Ags({host: 'mapststarcsvr1:6080'});

      //Create Services
      var addressesMs =  mapstest.setService({folder:'Addresses',service: '',server: 'MapServer'});
      var cip = gis.setService({folder:'PublicUtility',service: 'RPUD_Projects',server: 'MapServer'});
      var parcelsMs = maps.setService({folder:'',service: 'Parcels',server: 'MapServer'});
      var ptFs = mapstest.setService({folder:'PublicUtility',service: 'ProjectTracking',server: 'FeatureServer'});
      var ptMs = mapstest.setService({folder:'PublicUtility',service: 'ProjectTracking',server: 'MapServer'});
      var reclaimedMs = gis.setService({folder:'PublicUtility',service: 'ReclaimedDistribution',server: 'MapServer'});
      var sewerMs = maps.setService({folder:'PublicUtility',service: 'SewerExternal',server: 'MapServer'});
      var streetsMs = maps.setService({folder:'StreetsDissolved',service: '',server: 'MapServer'});
      var vechMs = dev.setService({folder:'Networkfleet',service: '',server: 'MapServer'});
      var waterMs = maps.setService({folder:'PublicUtility',service: 'WaterDistribution',server: 'MapServer'});

      var service = {
        addFieldFromTable: addFieldFromTable,
        addressesMs: addressesMs,
        cip: cip,
        geocoder: geocoder,
        getDocCounts: getDocCounts,
        parcelsMs: parcelsMs,
        ptFs: ptFs,
        ptMs: ptMs,
        reclaimedMs: reclaimedMs,
        sewerMs: sewerMs,
        streetsMs: streetsMs,
        vechMs: vechMs,
        waterMs: waterMs
      };

      return service;

      /**
      *@type method
      *@access public
      *@name addFieldFromTable
      *@desc Joins tables together based on field
      *@param {Array} t1 - Base table
      *@param {Array} t2 - Join table
      *@param {String} joinField - Field to be joined on
      *@param {String} addField - New field added to base table with join data
      *@returns {Array}
      */
      function addFieldFromTable(t1, t2, joinField, addField) {
        t1.map(function(t1Data){
          t2.forEach(function(t2Data){
            t1Data.attributes[addField] =  t1Data.attributes[joinField] === t2Data.attributes[joinField] ? t2Data.attributes[addField] : t1Data.attributes[addField];
          });
        });
        return t1;
      }

      /**
      *@type method
      *@access public
      *@name geocoder
      *@desc Geocodes address
      *@param {Object} options - geocoding parameters
      *@returns {HttpPromise}
      */
      function geocoder(options) {
        var endpoint = 'http://maps.raleighnc.gov/arcgis/rest/services/Locators/Composite/GeocodeServer/findAddressCandidates';
        var deferred = $q.defer();
        $http({
          method: 'GET',
          url: endpoint,
          params: options,
        })
        .success(function (data) {
          deferred.resolve(data);
        })
        .error(function(data, status){
          deferred.reject(data);
        });
        return deferred.promise;
      }

      /**
      *@type method
      *@access public
      *@name getDocCounts
      *@desc Get number of documents added to project
      *@param {Number} projectid - Projects Id
      *@returns {HttpPromise}
      */
      function getDocCounts(projectid) {
        var options = {
          layer: 'RPUD.PTK_DOCUMENTS',
          actions: 'query',
          params: {
            f: 'json',
            where: 'PROJECTID =  ' + projectid,
            outStatistics: [{
              'statisticType': 'count',
              'onStatisticField': 'DOCTYPEID',
              'outStatisticFieldName': 'DOC_COUNT'
            }],
            groupByFieldsForStatistics: 'DOCTYPEID'
          }
        }
        return this.ptMS.request(options);
      }

    }

})();
