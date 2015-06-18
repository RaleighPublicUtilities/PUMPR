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
          //   scope.projects = [];
          //   var baseproject;
          //   scope.supportTables = [
          //     {
          //         name: 'engTypes',
          //         id: 'RPUD.ENGINEERINGFIRM',
          //         joinField: 'ENGID',
          //         addField: 'SIMPLIFIEDNAME',
          //     },
          //     {
          //         name: 'sheetTypes',
          //         id: 'RPUD.SHEETTYPES',
          //         joinField: 'SHEETTYPEID',
          //         addField: 'SHEETTYPE',
          //     },
          //     {
          //         name: 'docTypes',
          //         id: 'RPUD.DOCUMENTTYPES',
          //         joinField: 'DOCTYPEID',
          //         addField: 'DOCUMENTTYPE',
          //     }
          //    ];
          //
          //
          //    //Watch for change of project
          //   scope.project = undefined;
          //   scope.refresh = function (project){
          //   if (project !== undefined){
          //     scope.supportTables.forEach(function(table){
          //       var name = table.name;
          //
          //       var options = {
          //         layer: table.id,
          //         actions: 'query',
          //         params: {
          //           f: 'json',
          //           where: '1=1',
          //           outFields: '*',
          //           orderByFields: table.addField + ' ASC',
          //           returnGeometry: false
          //         }
          //       };
          //       agsServer.ptFs.request(options).then(function(d){
          //         table.data = d.features;
          //         // agsServer.addFieldFromTable(project, table.data, table.joinField, table.addField);
          //         switch (name){
          //           case 'engTypes':
          //             scope.engTypes = table.data;
          //             break;
          //           case 'sheetTypes':
          //             scope.sheetTypes = table.data;
          //             break;
          //           case 'docTypes':
          //             scope.docTypes = table.data;
          //             break;
          //           default:
          //             console.log('Table not found');
          //         }
          //       });
          //     });
          //     //Adds new key value pair to data object for edit controls and sets boolean values to text
          //     //Probably should make this a method of ags service
              var utils = ['WATER', 'SEWER', 'REUSE', 'STORM'];
          //       project.forEach(function(data){
          //         //Sets all edit states to false
          //         data.edit = false;
          //         //Checks if file currently exisits
          //         checkUpload(data.attributes.PROJECTID + '-' + data.attributes.DOCTYPEID + '-' + data.attributes.DOCID).then(function(res){
          //           data.upload = res.data;
          //           data.upload.isSuccess = false;
          //         },
          //         function (error){
          //           console.error(error);
          //         });
          //         //Sets boolean values for utility options
          //         for (var _i = 0, _len = utils.length; _i < _len; _i++){
          //          data.attributes[utils[_i]] = data.attributes[utils[_i]] ? true : false;
          //         }
          //         //Convert number to date object
          //         if (typeof data.attributes.SEALDATE === 'number' && !isNaN(data.attributes.SEALDATE)){
          //           data.attributes.SEALDATE = new Date(data.attributes.SEALDATE);
          //         }
          //
          //       });
          //   }
          //   console.log(scope.project)
          // };
          //

          //Add new document visibility controll
          scope.addDoc = true;
          //Master Copy of projects base  data
          scope.master = [];
          //Get pick lists for table
          var helperTables = DocumentFactory.getTables()
            .then(function(data){
              console.log(data);
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
                checkUpload(data.attributes.PROJECTID + '-' + data.attributes.DOCTYPEID + '-' + data.attributes.DOCID).then(function(res){
                    data.upload = res.data;
                    data.upload.isSuccess = false;
                },
                function (error){
                    console.error(error);
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
          var data = scope.project;
          if (data.length === 1 && data[0].new){
            //Set first document id
            data[0].attributes.DOCID =  1;
            utils.forEach(function(item){
              data[0].attributes[item] = 0;
            });
            //Add document
            DocumentFactory.add(data[0].attributes)
              .then(function(res){
                console.log(res);
                //Sets boolean values for utility options
                utils.forEach(function(item){
                  data[0].attributes[item] = false;
                });

                scope.project.splice(0, 1, {attributes: data[0].attributes, edit: false});
              })
              .catch(function(err){
                console.log(err);
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
                  PROJECTNAME: fillData.PROJECTNAME
                };

                if (fillData.ENGID){
                  addData.ENGID = fillData.ENGID;
                }
                if (fillData.SEALDATE instanceof Date){
                  addData.SEALDATE = fillData.SEALDATE.getTime();
                }

            console.log(addData);
            DocumentFactory.add(addData)
              .then(function(res){
                console.log(res);
                if (addData.ENGID){
                  scope.engTypes.forEach(function(data){
                    addData.SIMPLIFIEDNAME = addData.ENGID === data.attributes.ENGID ? data.attributes.SIMPLIFIEDNAME : addData.SIMPLIFIEDNAME;
                  });
                  scope.project.push({attributes: addData, edit: false});
                }
                else{
                  scope.project.push({attributes: addData, edit: false});
                }

              })
              .catch(function(err){
                console.log(res);
              });
          }
          // var firstRecord, engid;
          // // scope.addDoc = false;
          // if (scope.project){
          //   console.log(scope.project)
          //   if (scope.project.length === 1){
          //     firstRecord = scope.project[0].attributes
          //     scope.newDocument = new DocumentFactory({
          //       PROJECTNAME: firstRecord.PROJECTNAME,
          //       PROJECTID: firstRecord.PROJECTID,
          //       DEVPLANID: firstRecord.DEVPLANID || undefined,
          //       DOCID: 1
          //     });
          //
          //     scope.newDocument.postNewDoc();
          //     scope.newDoc = scope.newDocument.getData();
          //     scope.project.push({attributes: scope.newDoc, edit: false});
          //   }
          //   else {
          //     var fillData = scope.project[scope.project.length -1].attributes,
          //         sealdate = fillData.SEALDATE;
          //
          //     //Convert date object to timestamp
          //     if (sealdate instanceof Date){
          //       sealdate = sealdate.getTime();
          //     }
          //
          //     if (fillData.ENGID){
          //       engid = {
          //         ENGID: fillData.ENGID,
          //         SIMPLIFIEDNAME: fillData.SIMPLIFIEDNAME
          //       };
          //     }
          //     else{
          //       engid = scope.project.length > 1 ? scope.project[1].ENGID.attributes : undefined;
          //     }
          //       // var engid = scope.project.length > 1 ? scope.project[1].ENGID.attributes : undefined;
          //       console.log(engid, scope.project.length)
          //
          //     scope.newDocument = new DocumentFactory({
          //       PROJECTNAME: fillData.PROJECTNAME,
          //       PROJECTID: fillData.PROJECTID,
          //       DEVPLANID: fillData.DEVPLANID || undefined,
          //       ENGID: engid.ENGID || undefined,
          //       SEALDATE: sealdate,
          //       DOCID: scope.project[scope.project.length - 1].attributes.DOCID + 1 || 1
          //     });
          //
          //     //POSTS new document to AGS server
          //     scope.newDocument.postNewDoc();
          //     scope.newDoc = scope.newDocument.getData();
          //
          //     // var sealdate = scope.newDoc.SEALDATE;
          //     console.log(scope.newDoc);
          //     //Set engineering firm for display
          //     scope.newDoc.SIMPLIFIEDNAME = engid.SIMPLIFIEDNAME;
          //     scope.project.push({attributes: scope.newDoc, edit: false});
          //     // scope.addDoc = true;
          //   }
          // }
          // else{
          //   console.log('Please try again')
          // }
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

          console.log(data);

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
          //Sets updated values
          // scope.updateDocument = new DocumentFactory(data).setValue(data);
          //Updates document on server
          // scope.updateDocument.updateDoc()
          // .then(function(data){
          //   if (data.error){
          //     console.log(data.error);
          //     angular.element(targ).addClass('animated shake addDocFailure');
          //   }
          //   else{
          //     angular.element(targ).addClass('addDocSuccess');
          //   }
          // },
          // function(err){
          //   angular.element(targ).addClass('animated shake addDocFailure');
          // });
        };

        scope.delete = function (index, data){
          var master = {
            attributes: {
              DEVPLANID: '',
              PROJECTID: '',
              PROJECTNAME: ''
            },
            new: true,
            edit: false
          };

          DocumentFactory.delete(data)
            .then(function(res){
              if (index === 0){
                angular.extend(master, scope.project[0]);
                scope.project.splice(0, 1, master);
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
