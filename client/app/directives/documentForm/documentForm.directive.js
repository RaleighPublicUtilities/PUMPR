'use strict';

angular.module('pumprApp')
  .directive('documentForm',  ['agsServer', 'DocumentFactory', 'streetSearch', '$timeout', '$filter', '$http',
    function (agsServer, DocumentFactory, streetSearch, $timeout, $filter, $http) {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        project: '='
      },
      templateUrl: 'app/directives/documentForm/documentForm.html',
      link: function (scope) {

              var utils = ['WATER', 'SEWER', 'REUSE', 'STORM'];

          //Add new document visibility controll
          scope.addDoc = true;
          //Master Copy of projects base  data
          scope.master = [];
          //Get pick lists for table
          var helperTables = DocumentFactory.getTables()
            .then(function(data){
              scope.engTypes = data[0].features;
              scope.sheetTypes = data[1].features;
              scope.docTypes = data[2].features;
            })
            .catch(function(err){
              console.error(err);
            });

          //Setup Boolean option for utilies options..could/should switch to service or provider
          scope.selectionOptions = {
            bool: [{'name': 'true', 'id': 1}, {'name': 'false', 'id': 0}],
          };

          scope.$watchCollection('project',function(newVal, oldVal){
            console.log(newVal)
            scope.project = newVal;
            if (scope.project !== undefined && Array.isArray(scope.project)){
              scope.project.forEach(function(data){
                //Sets all edit states to false
                data.edit = false;
                //Checks if file currently exisits
                checkUpload(data.attributes.PROJECTID + '-' + data.attributes.DOCTYPEID + '-' + data.attributes.DOCID)
                  .then(function(res){
                    data.upload = res.data;
                    data.upload.isSuccess = false;
                })
                .catch(function (error){
                    console.log(error);
                });

                //Convert number to date object
                if (typeof data.attributes.SEALDATE === 'number' && !isNaN(data.attributes.SEALDATE)){
                  data.attributes.SEALDATE = new Date(data.attributes.SEALDATE);
                }

              });
            }
          });


        //Starts edit session on selected table row
        scope.edit = function (doc) {
          //resets documet
          scope.project.forEach(function(data){
            data.edit = false;
          });
          //Activates editor
          doc.edit = true;
          //Turns off editor after 10 seconds
          $timeout(function(){
            doc.edit = false;
          }, (60000 * 5));
        };


        scope.add = function(){
          scope.addError = false;
          var data = scope.project;
          if (data.length === 1 && data[0].new){
            //Set first document id
            data[0].attributes.DOCID =  1;
            utils.forEach(function(item){
              data[0].attributes[item] = 0;
            });
            //Add document
            scope.addPromise = DocumentFactory.add(data[0].attributes)
              .then(function(res){
                console.log(res);
                if (res.error){
                  console.log(res.error);
                  scope.addError = true;
                }
                else{
                  //Set objectid
                  data[0].attributes.OBJECTID = res.addResults[0].objectId;
                  //Sets boolean values for utility options
                  utils.forEach(function(item){
                    data[0].attributes[item] = false;
                  });

                  scope.project.splice(0, 1, {attributes: data[0].attributes, edit: false});
                }

              })
              .catch(function(err){
                console.log(err);
                scope.addError = true;
              });
          }
          else{
            var count = data.length + 1,
                index = count - 2,
                fillData = data[index].attributes,
                // angular.copy(data[index].attributes, fillData),

                addData = {
                  DOCID: count,
                  DEVPLANID: fillData.DEVPLANID,
                  PROJECTID: fillData.PROJECTID,
                  PROJECTNAME: fillData.PROJECTNAME,
                  WATER: 0,
                  SEWER: 0,
                  REUSE: 0,
                  STORM: 0
                };
                console.log(fillData);
                if (fillData.ENGID){
                  addData.ENGID = fillData.ENGID.attributes ? fillData.ENGID.attributes.ENGID : fillData.ENGID;
                }
                if (fillData.SEALDATE instanceof Date){
                  addData.SEALDATE = fillData.SEALDATE.getTime();
                }

            console.log(addData);
            scope.addPromise = DocumentFactory.add(addData)
              .then(function(res){
                console.log(res);
                if (res.error){
                  console.log(res.error);
                  scope.addError = true;
                }
                else{
                  angular.extend(addData, {
                    OBJECTID: res.addResults[0].objectId,
                    WATER: {'name': 'false', 'id': 0},
                    SEWER: {'name': 'false', 'id': 0},
                    REUSE: {'name': 'false', 'id': 0},
                    STORM: {'name': 'false', 'id': 0}
                  });
                  addData.OBJECTID = res.addResults[0].objectId
                  if (addData.ENGID){
                    scope.engTypes.forEach(function(data){
                      addData.SIMPLIFIEDNAME = addData.ENGID === data.attributes.ENGID ? data.attributes.SIMPLIFIEDNAME : addData.SIMPLIFIEDNAME;
                    });
                    scope.project.push({attributes: addData, edit: false});
                  }
                  else{
                    scope.project.push({attributes: addData, edit: false});
                  }
                }
              })
              .catch(function(err){
                console.log(err);
                scope.addError = true;
              });
          }

        };


        //Post data to server
        scope.post = function(data){
          var targ;
        	if (!e) var e = window.event;
        	if (e.target) targ = e.target;
        	else if (e.srcElement) targ = e.srcElement;
        	if (targ.nodeType == 3) // defeat Safari bug
        		targ = targ.parentNode;
            angular.element(targ).removeClass('animated shake addDocFailure addDocSuccess');

          DocumentFactory.update(data)
            .then(function(res){
              if (res.error){
                angular.element(targ).addClass('animated shake addDocFailure');
              }
              else{
                angular.element(targ).addClass('addDocSuccess');
              }
            })
            .catch(function(err){
              angular.element(targ).addClass('animated shake addDocFailure');
            });

        };

        scope.delete = function (index, data){
          var master = {
            attributes: {},
            new: true,
            edit: false
          };

          scope.deletePromise = DocumentFactory.delete(data)
            .then(function(res){
              if (index === 0){
                console.log(scope.project)
                master.attributes.DEVPLANID = scope.project[0].attributes.DEVPLANID;
                master.attributes.PROJECTID = scope.project[0].attributes.PROJECTID;
                master.attributes.PROJECTNAME = scope.project[0].attributes.PROJECTNAME;
                console.log(master)
                scope.project.splice(0, 1, master);
              }
              else if (res.error){
                console.log(res);
              }
              else{
                //Deletes document object from array
                scope.project.splice(index, 1);
              }
              console.log(res);
            })
            .catch(function(err){
              console.log(err);
            });
        };

        function checkUpload (filename){
          var config = {
            params: {
              filename: filename
            }
          };
          return $http.get('/api/documents', config);
        }


      }
    };
  }
]);
