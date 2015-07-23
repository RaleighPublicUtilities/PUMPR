'use strict';

angular.module('pumprApp')
  .factory('fireflowFactory', function (agsServer) {
    // Service logic
    // ...
    var flowLog = [];


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
      }
    };
  });
