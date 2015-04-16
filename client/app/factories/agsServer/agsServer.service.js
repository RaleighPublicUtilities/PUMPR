'use strict';

angular.module('pumprApp')
  .factory('agsServer', ['Ags', function(Ags){
  //Create Server objects
  var mapstest = new Ags({host: 'mapstest.raleighnc.gov'}),
      maps = new Ags({host: 'maps.raleighnc.gov'}),
      gis = new Ags({host: 'maps.raleighnc.gov'});

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

    //Reclaimed Map Server
    reclaimedMs: gis.setService({
      folder:'PublicUtility',
      service: 'ReclaimedDistribution',
      server: 'MapServer'
    }),

    //Water Map Server
    waterMs: gis.setService({
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
    })

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
