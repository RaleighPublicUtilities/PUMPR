'use strict';

angular.module('pumprApp')
  .factory('agsServer', ['Ags', '$q', '$http', function(Ags, $q, $http){
  //Create Server objects

  var mapstest = new Ags({host: 'mapststarcsvr1:6080'}),
      maps = new Ags({host: 'maps.raleighnc.gov'}),
      gis = new Ags({host: 'gis.raleighnc.gov'}),
      dev = new Ags({host: 'geodevapplv1:6080'});
  //Create services
  var services = {
    //Project Tracking MapService
    ptMs: mapstest.setService({
      folder:'PublicUtility',
      service: 'ProjectTracking',
      server: 'MapServer'
    }),

  //Project Tracking Feature Service
    ptFs: mapstest.setService({
      folder:'PublicUtility',
      service: 'ProjectTracking',
      server: 'FeatureServer',
      header: {'Content-Type': 'application/json'}
    }),

    //Streets Service
    streetsMs: maps.setService({
      folder:'StreetsDissolved',
      service: '',
      server: 'MapServer',
    }),

    //Streets Service
    addressesMs: maps.setService({
      folder:'Addresses',
      service: '',
      server: 'MapServer',
    }),

    //Reclaimed Map Server
    reclaimedMs: gis.setService({
      folder:'PublicUtility',
      service: 'ReclaimedDistribution',
      server: 'MapServer'
    }),

    //Water Map Server
    waterMs: maps.setService({
      folder:'PublicUtility',
      service: 'WaterDistribution',
      server: 'MapServer'
    }),

    //Sewer Map Server
    sewerMs: maps.setService({
      folder:'PublicUtility',
      service: 'SewerExternal',
      server: 'MapServer'
    }),

    //Parcels Map Server
    parcelsMs: maps.setService({
      folder:'',
      service: 'Parcels',
      server: 'MapServer'
    }),

    //GeoEvent Vehicles
    vechMs: dev.setService({
      folder:'Networkfleet',
      service: '',
      server: 'MapServer'
    }),

    cip: gis.setService({
      folder:'PublicUtility',
      service: 'RPUD_Projects',
      server: 'MapServer'
    }),

    geocoder: function(options){
      var endpoint = 'http://maps.raleighnc.gov/arcgis/rest/services/Locators/Composite/GeocodeServer/findAddressCandidates';
        var deferred = $q.defer();
         $http({
           method: 'GET',
           url: endpoint,
           params: options,
         }).success(function (data) {
           deferred.resolve(data);
         }).
         error(function(data, status){
           deferred.reject(data);
         });
         return deferred.promise;
       }

  };

  //Joins tables together based on field
  //addFieldFromTable(table1, table2, joinField, addFiedl);
  services.addFieldFromTable = function (t1, t2, joinField, addField){
   t1.map(function(t1Data){
     t2.forEach(function(t2Data){
       t1Data.attributes[addField] =  t1Data.attributes[joinField] === t2Data.attributes[joinField] ? t2Data.attributes[addField] : t1Data.attributes[addField];
     });
   });
   return t1;
 };

 services.getDocCounts = function(projectid){
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
   };

   return this.ptMS.request(options);
 };

  return (services);

}]);
