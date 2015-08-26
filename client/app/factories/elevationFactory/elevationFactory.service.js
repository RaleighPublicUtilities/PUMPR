'use strict';

angular.module('pumprApp')
  .factory('elevationFactory', function ($http) {
    // Service logic
    // ...

    var url = 'http://elevation.arcgis.com/arcgis/rest/services/Tools/Elevation/GPServer/SummarizeElevation/submitJob';

    // Public API here
    return {
      getElevation: function (featureSet) {
        var config = {
          params: {
            InputFeatures: featureSet,
            FeatureIDField: 'FACILITYID',
            DEMResolution: 'FINEST',
            IncludeSlopeAspect: false
          }
        };
        return $http.get(url, config);
      }
    };
  });
