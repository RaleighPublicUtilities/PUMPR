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

        var re = new RegExp('http://[a-z]{3,8}.raleighnc.gov/arcgis/rest/services/');
        var re1 = new RegExp('http://mapststarcsvr1:6080/arcgis/rest/services/');
        var result = re.test(config.url);
        var result1 = re1.test(config.url);
        if (result || result1){
          delete config.headers.Authorization;
          return config;
        }
        else {
          config.headers = config.headers || {};
          if ($cookieStore.get('token')) {
            config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
            console.log(config);
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
