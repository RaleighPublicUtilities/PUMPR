'use strict';

angular.module('pumprApp')
  .factory('fireflowFactory', function (agsServer) {
    // Service logic
    // ...
    var flowLog = [];
    var formStatus = false;

    // Public API here
    return {
      find: function (latlng) {

        var options = {
          params: {
              f: 'json',
              geometry: {x: latlng.lng, y: latlng.lat},
              mapExtent: [latlng.lng, latlng.lat, latlng.lng + 0.01, latlng.lat + 0.01].toString(),
              tolerance: 1,
              imageDisplay: '635,460,96',
              layers: 'Water Hydrants',
              sr: 4326
            },
            actions: 'identify',
            geojson: true
        };

        return agsServer.waterMs.request(options);
      },
      addLog: function (hydrant){
        flowLog.push(hydrant);
        return flowLog;
      },
      removeLog: function (){
        console.log(flowLog)
        if (flowLog.length > 0){
          flowLog.pop();
        }
        return flowLog;
      },
      getLog: function (){
        return flowLog;
      },
      clearLog: function (){
        flowLog = [];
        return flowLog;
      },
      getForm: function (){
        var options = {
          layer: 'RPUD.FireFlow',
          actions: 'query',
          params: {
            f: 'json',
            where: '1=1',
            outFields: '*',
            returnGeometry: false
          }
        };
        return agsServer.ptFs.request(options);

      },
      setFormStatus: function (stat){
        formStatus = stat;
        return formStatus;
      },
      getFormStatus: function(){
        return formStatus;
      }
    };
  });
