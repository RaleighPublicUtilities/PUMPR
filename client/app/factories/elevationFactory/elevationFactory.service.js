'use strict';

angular.module('pumprApp')
  .factory('elevationFactory', function ($http) {
    // Service logic
    // ...



    // Public API here
    return {
      getElevation: function (hydrant, token) {
        var featureSet = {
          "geometryType":"esriGeometryPoint",
          "spatialReference": 4326,
          "fields":'FACILITYID',
          "features":[
            {
              "geometry" : {
                "x" : hydrant.lng,
                "y" : hydrant.lat
              }
            }
          ]
        };
        var config = {
          method: 'POST',
          url: 'http://elevation.arcgis.com/arcgis/rest/services/Tools/Elevation/GPServer/Profile/submitJob',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          params: {},
          data: $.param({
              InputFeatures: featureSet,
              FeatureIDField: 'FACILITYID',
              DEMResolution: 'FINEST',
              IncludeSlopeAspect: false
          })
        };
        return $http(config);
      }
    };
  });
