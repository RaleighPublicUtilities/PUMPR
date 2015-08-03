'use strict';

angular.module('pumprApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ui.bootstrap',
  'autocomplete',
  'agsserver',
  'leaflet-directive',
  'angularFileUpload',
  'chart.js',
  'cgBusy'
])
  .config(function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
  })
  .value('mapLayers', {
        baselayers: {
            raleighImagery: {
              name: 'Raleigh Imagery',
              url: 'http://api.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}.png?access_token={token}',
              type: 'xyz',
              layerParams: {
                token: 'pk.eyJ1IjoiY3R3aGl0ZSIsImEiOiItb0dqdUlZIn0.4Zb1DGESXnx0ePxMVLihZQ',
                mapId: 'ctwhite.mdf6egjp'
              },
            },
            raleighTerrain: {
              name: 'Raleigh Terrain',
              url: 'https://{s}.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}.png?access_token={token}',
              type: 'xyz',
              layerParams: {
                token: 'pk.eyJ1IjoiY3R3aGl0ZSIsImEiOiItb0dqdUlZIn0.4Zb1DGESXnx0ePxMVLihZQ',
                mapId: 'ctwhite.g8n5fjjp'
              },
            },
        },
        overlays: {
          projects:{
            name: 'Project Tracking',
            type: 'agsDynamic',
            url: 'http://mapststarcsvr1:6080/arcgis/rest/services/PublicUtility/ProjectTracking/MapServer',
            visible: false,
            layerOptions: {
                layers: [1],
                  opacity: 0.4,
                  attribution: 'Copyright:© 2015 City of Raleigh',
                  position: 'back'
            }
          },
            sewer: {
              name: 'Sewer Collection Network',
              type: 'agsDynamic',
              url: 'http://maps.raleighnc.gov/arcgis/rest/services/PublicUtility/SewerExternal/MapServer',
              visible: true,
              layerOptions: {
                  layers: [0,1,2,3,4],
                    opacity: 1,
                    attribution: 'Copyright:© 2015 City of Raleigh',
                    position: 'back'
              }
        },
        water: {
          name: 'Water Distribution Network',
            type: 'agsDynamic',
            url: 'http://maps.raleighnc.gov/arcgis/rest/services/PublicUtility/WaterDistribution/MapServer',
            visible: true,
            layerOptions: {
                layers: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
                  opacity: 1,
                  attribution: 'Copyright:© 2015 City of Raleigh',
                  position: 'back'
            }
        },
        reuse: {
          name: 'Reuse Distribution Network',
            type: 'agsDynamic',
            url: 'http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/ReclaimedDistribution/MapServer',
            visible: true,
            layerOptions: {
                layers: [0,1,2,3,4,5,6,7,8,9,10,11],
                  opacity: 1,
                  attribution: 'Copyright:© 2015 City of Raleigh',
                  position: 'back'
            }
        },
        cip: {
          name: 'Active CIP Projects',
            type: 'agsDynamic',
            url: 'http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/RPUD_Projects/MapServer',
            visible: false,
            layerOptions: {
                layers: [0],
                  opacity: 1,
                  attribution: 'Copyright:© 2015 City of Raleigh',
                  position: 'back'
            }
        },
        detailsIntersections: {
          name: 'Detailed Intersections',
          type: 'agsDynamic',
          url: 'http://mapststarcsvr1:6080/arcgis/rest/services/PublicUtility/ProjectTracking/MapServer',
          visible: false,
          layerOptions: {
            layers: [0],
            opacity: 1,
            attribution: 'Copyright:© 2015 City of Raleigh',
            position: 'back'
          }
        },
        parcels: {
          name: 'Parcels',
          type: 'agsDynamic',
          url: 'http://maps.raleighnc.gov/arcgis/rest/services/Parcels/MapServer',
          visible: false,
          layerOptions: {
            layers: ['*'],
            opacity: 1,
            attribution: 'Copyright:© 2015 City of Raleigh',
            position: 'back'
          }
        },
      vehicles: {
        name: 'Vehicles',
        type: 'agsDynamic',
        url: 'http://geodevapplv1:6080/arcgis/rest/services/Networkfleet/MapServer',
        visible: false,
        layerOptions: {
          layers: [0],
          opacity: 1,
          attribution: 'Copyright:© 2015 City of Raleigh',
          position: 'back'
        }
      }
    }
  })
  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        //Check if request is for arcgis server and do not add bearer token if it is


        var re = /\/arcgis\/rest\/services\//;
        var water = /maps.raleighnc.gov\/arcgis\/rest\/services\//;

        if (water.test(config.url)){
            delete config.headers.Authorization;
            var d = new Date().getTime();
            if ($cookieStore.get('agolToken') && (d > $cookieStore.get('agolTokenExp'))){
              $location.path('/login');
              $cookieStore.remove('token');
              $cookieStore.remove('agolToken');
              $cookieStore.remove('agolTokenExp');
            }
            else if ($cookieStore.get('agolToken')) {
              config.params.token = $cookieStore.get('agolToken');
            }
            return config;
          }
          else if (re.test(config.url)){
            delete config.headers.Authorization;
            return config;
          }
          else {
            config.headers = config.headers || {};
            if ($cookieStore.get('token')) {
              config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
            }
            return config;
          }
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          $location.path('/login');
          // remove any stale tokens
          $cookieStore.remove('token');
          $cookieStore.remove('agolToken');
          $cookieStore.remove('agolTokenExp');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .run(function ($rootScope, $location, Auth) {
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$routeChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });
    });
  });
