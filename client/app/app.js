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
