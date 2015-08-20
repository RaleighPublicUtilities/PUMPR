'use strict';

angular.module('pumprApp')
  .directive('fireflowForm', function (fireflowFactory, Auth, agsDomains) {
    return {
      templateUrl: 'app/directives/fireflowForm/fireflowForm.html',
      transclude: true,
      restrict: 'E',
      scope: {
        hydrants: '='
      },
      link: function (scope) {
        var user = Auth.getCurrentUser();
        scope.goBack = fireflowFactory.setFormStatus;
        scope.flowData = {};

        //Pull in domains
        scope.diameter = agsDomains.diameter;




        scope.$watchCollection('hydrants', function(){
          if (Array.isArray(scope.hydrants) && scope.hydrants.length === 2){
            //Set defualt values
            angular.extend(scope.flowData, {
              TESTFACILITYID: scope.hydrants[0].message.split(':')[1].trim(),
              FLOWFACILITYID: scope.hydrants[1].message.split(':')[1].trim(),
              APPLICANTNAME: user.name,
              CONTACTEMAIL: user.email
            });
            //Get Values From Associated Water features
            scope.hydrants.forEach(function (hydrant, index){
            fireflowFactory.getRelatedFeatures(hydrant)
              .then(function(res){
                //console.log(res);
                res.results.forEach(function(item){
                  //console.log(item)
                  switch (item.layerName) {
                    case 'Water Pressure Mains':
                        agsDomains.diameter.some(function(d){
                            if (index){
                              scope.flowDiameter = d.desc === item.attributes.Diameter ? d.code : null;
                              return d.desc === item.attributes.Diameter;
                            }
                            else{
                              scope.testDiameter = d.desc === item.attributes.Diameter ? d.code : null;
                              return d.desc === item.attributes.Diameter;
                            }
                        });
                      break;
                    case 'Water Pressure Zones':
                      scope.pressureZone = item.attributes['Pressure Zone Identifier'] || undefined;
                      break;
                    default:

                  }
                });
                //Set form object
                angular.extend(scope.flowData, {
                  TESTMAINSIZE: scope.testDiameter,
                  FLOWMAINSIZE: scope.flowDiameter,
                  PRESSUREZONE: scope.pressureZone
                });
              }).
              catch(function(err){
                console.log(err);
              });
            });
          }
        });

        scope.submit = function (data){
          fireflowFactory.submitForm(data)
            .then(function(res){
              console.log(res);
            })
            .catch(function(err){
              console.log(err);
            });
        };
        // scope.findAddress = function (typed){
        //   var typed = typed.toUpperCase();
        //   var options = {
        //     layer: 'Addresses',
        //     geojson: false,
        //     actions: 'query',
        //     params: {
        //       f: 'json',
        //       outFields: 'ADDRESSU, CITY, STATE, ZIP',
        //       where: "ADDRESSU like '%" +typed + "%'",
        //       returnGeometry: false,
        //       orderByFields: 'ADDRESSU ASC'
        //     }
        //   };
        //   scope.addressPromise = agsServer.addressesMs.request(options);
        //   return scope.addressPromise
        //     .then(function(data){
        //       if (data.error){
        //         console.log(data.error);
        //       }
        //       else {
        //         return data.features.map(function(item){
        //           return item.attributes.ADDRESSU + ', ' +  item.attributes.CITY + ', ' +  item.attributes.STATE + ', ' +  item.attributes.ZIP;
        //       });
        //       }
        //     })
        //     .catch(function(err){
        //       console.log(err);
        //     });
        // };
        //
        // scope.searchControl = function (item){
        //   scope.flowData.ADDRESS = item;
        // }

        // fireflowFactory.getForm().then(function(res){
        //     console.log(res);
        //   })
        //   .catch(function(err){
        //     console.log(err);
        //   });

      }
    };
  });
