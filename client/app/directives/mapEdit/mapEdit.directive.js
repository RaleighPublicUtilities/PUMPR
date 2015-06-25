'use strict';

angular.module('pumprApp')
  .directive('mapEdit', ['agsServer', '$filter', 'leafletData', function (agsServer, $filter, leafletData) {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        data: '=',
        active: '='
      },
      templateUrl: 'app/directives/mapEdit/mapEdit.html',
      link: function (scope) {


        //Constants
        var datesList = ['WATERUPDATEDWHEN', 'SEWERUPDATEDWHEN', 'REUSEUPDATEDWHEN', 'ACCEPTANCEDATE', 'WARRANTYENDDATE', 'DEVPLAN_APPROVAL'],
            numberList = ['CIP', 'WATER', 'SEWER', 'REUSE', 'STORM'];
        scope.editorList =['kellerj', 'mazanekm', 'rickerl', 'sorrellj', 'stearnsc', 'whitec'];
        scope.master = {};

        //Options to post to server
        var postOptions = {
          layer: 'Project Tracking',
          params: {
            f: 'json',
            gdbVersion: 'SDE.DEFAULT',
            features: [{}]
          }
        };

        //Seach options for getting projectid
        var options = {
          actions: 'query',
          layer: 'Project Tracking',
          params: {
            f: 'json',
            outFields: 'PROJECTID',
            orderByFields: 'PROJECTID DESC',
            returnGeometry: false,
            where: 'PROJECTID IS NOT NULL'
          }

        };

        //Function that returns projectid
        scope.generateProjectId = function () {
          agsServer.ptFs.request(options).then(function(data){
            scope.currentMaxProjectId = data.features[0].attributes.PROJECTID;
            scope.newMaxProjectId = scope.currentMaxProjectId + 1;
            scope.update.PROJECTID = parseInt(scope.update.PROJECTID, 10) || parseInt(scope.newMaxProjectId, 10);
            postOptions.actions = scope.update.OBJECTID ? 'updateFeatures' : 'addFeatures';
            // console.log(data);
            scope.newProject = {
              'geometry' : scope.data.geometry,
              'attributes' : scope.update
            };
          },
          function (err){
            console.log(err);
          });
        };



        scope.saveToMaster = function() {
          // postOptions.params.features = [scope.newProject];
          angular.copy([scope.newProject], postOptions.params.features);
          var getReady = postOptions.params.features[0].attributes;
          //Loops throught the get ready object, so changes can be made to data before being sent to the server
          for (var i in getReady){
            //Makes all string fields uppercase
            getReady[i] = typeof getReady[i] === 'string' ? getReady[i].toUpperCase() : getReady[i];
            //Turns boolean to integers from strings
            getReady[i] = getReady[i] === '0' || getReady[i] && numberList.indexOf(i) !== -1 ? parseInt(getReady[i], 10) : getReady[i];
            //Converts date for database
            getReady[i] = getReady[i] instanceof Date ? $filter('date')(getReady[i], 'MM/dd/yyyy') : getReady[i]; //Date.parse(getReady[i])
          }
          //Checks if adding new features a check to make sure projectid is still current
          if (postOptions.actions === 'addFeatures'){
            agsServer.ptFs.request(options)
              .then(function(data){
                scope.newMaxProjectId = data.features[0].attributes.PROJECTID + 1;
                getReady.PROJECTID = parseInt(scope.newMaxProjectId, 10);
                //Post new feature data to server
                agsServer.ptFs.request(postOptions)
                  .then(function(data){
                    console.log(data);
                  },
                  //Error if post to server fails
                  function(err){
                    console.log(err);
                });
              },
              //Error if get projectid fails
              function (err){
                console.log(err);
              });
          }
          else {
            //Post update data to server
            agsServer.ptFs.request(postOptions)
            .then(function(data){
              console.log(data);
            },
            function(err){
              console.log(err);
            });
          }

          scope.active = false;
        };

        scope.reset = function(form) {
          if (form) {
            form.$setPristine();
            form.$setUntouched();
          }
          scope.update = angular.copy(scope.master);

        };
        scope.cancel = function(form) {
          if (form) {
            form.$setPristine();
            form.$setUntouched();
          }
          scope.update = angular.copy(scope.master);
          // angular.element('.map-edit-container').addClass('animated slideOutRight');
          scope.active = false;

          // angular.element('.angular-leaflet-map').removeClass('animated slideInLeft');
        };


        scope.reset(scope.form);
        //Gets correct REST endpoints form ArcGIS server




        leafletData.getMap('mini-map').then(function(map) {
          L.tileLayer('http://api.tiles.mapbox.com/v4/ctwhite.mdf6egjp/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiY3R3aGl0ZSIsImEiOiItb0dqdUlZIn0.4Zb1DGESXnx0ePxMVLihZQ').addTo(map);
        });



        function convertDate (date){
          if(!date instanceof Date){
            var original = date.split('/'),
            yyyy = original[2],
            MM = original[0],
            dd = original[1];
            return new Date(yyyy, MM, dd);
          }
          else if (date){
            $filter('date')(date, 'yyyy/MM/dd');
          }
          else {
            console.log(date);
          }
        }

        scope.$watchCollection('active', function(){
          if(scope.active){
            // angular.element('.angular-leaflet-map').addClass('animated slideInLeft');
          }
          else {
            // angular.element('.angular-leaflet-map').addClass('animated slideOutLeft');
            // angular.element('.angular-leaflet-map').removeClass('animated slideInLeft');
          }
        });

        //Update mini map with edited data
        scope.$watchCollection('data', function(){
          scope.master = {};
          if (scope.data){
            scope.reset(scope.form);
            //Add geojosn to map
            angular.extend(scope, {
              geojson: {
                data: scope.data,
                style: {
                    fillColor: 'rgba(253, 165, 13)',
                    weight: 3,
                    opacity: 1,
                    color: 'rgba(253, 165, 13, 0.71)',
                    dashArray: '4'
                },
                onEachFeature: function (feature, layer){
                  leafletData.getMap('mini-map').then(function(map) {
                    map.fitBounds(layer.getBounds());
                  });
                }
              }
            });
            // scope.reset(scope.form);
            for (var e in datesList){
              if (scope.data.properties[datesList[e]]){
                console.log('Date action');
                // console.log(scope.data.properties[datesList[e]]);
                scope.data.properties[datesList[e]] = convertDate(scope.data.properties[datesList[e]]);
              }
            }
            // console.log(scope.data);
            // if (scope.data.properties)
            angular.extend(scope.update, scope.data.properties);
            agsServer.ptFs.request(options).then(function(data){
                scope.currentMaxProjectId = data.features[0].attributes.PROJECTID;
                scope.newMaxProjectId = scope.currentMaxProjectId + 1;
                scope.update.PROJECTID = parseInt(scope.update.PROJECTID, 10) || parseInt(scope.newMaxProjectId, 10);
                postOptions.actions = scope.update.OBJECTID ? 'updateFeatures' : 'addFeatures';


                scope.newProject = {
                  'geometry' : Terraformer.ArcGIS.convert(scope.data.geometry),
                  'attributes' : scope.update
                };

              },
              function (err){
                console.log(err);
              });
          }

        });





      }
    };
  }]);
