'use strict';

angular.module('pumprApp')
  .factory('elevationFactory', function ($http) {
    // Service logic
    // ...

    var url = 'http://elevation.arcgis.com/arcgis/rest/services/Tools/Elevation/GPServer/SummarizeElevation/submitJob';
    var tokenUrl = 'https://www.arcgis.com/sharing/rest/generatetoken';

    // Public API here
    return {
      getElevation: function (hydrant) {
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
          params: {
            InputFeatures: featureSet,
            FeatureIDField: 'FACILITYID',
            DEMResolution: 'FINEST',
            IncludeSlopeAspect: false
          }
        };
        return $http.post(url, config);
      }
    };
  });
