'use strict';

angular.module('pumprApp')
  .controller('ProjectDocumentCtrl', ['$scope', '$location', '$sce', 'search', 'Auth',
    function ($scope, $location, $sce, search, Auth) {
      $scope.isLoggedIn = Auth.isLoggedIn;
      var documentid = $scope.documentid = $location.path().split('/')[3];
      $scope.documentInfo = $scope.documentid.split('-');
      $scope.projectname;
      $scope.documentDetails;
      $scope.testDate = Date.now();
      var projectDocuments;
      var projectid = $scope.projectid = $scope.documentInfo[0];
      var docid = $scope.docid = parseInt($scope.documentInfo[2], 10);
      var url = $scope.url = $sce.trustAsResourceUrl('/api/documents/' + projectid + '/' + documentid);


    //Request project documents from server
    search.documents(projectid)
      .then(function(res){
        if (res.error){

        }
        //Get list of project documents
        projectDocuments = res;

        //Set page view
        projectDocuments.forEach(function(doc){
          if (doc.attributes.DOCID === docid){
            $scope.documentDetails = doc.attributes;
          }
        });
      })
       .catch(function(err){
         console.log(err);
      });



      function getDocPath(documents, docid){
        var path = '/project/' + projectid + '/';

        //set the document id at the begin and end
        if (docid > documents.length){
          docid = 1;
        }
        else if (docid < 1){
          docid = documents.length
        }

        //set document path
        documents.forEach(function(doc){
            var doc = doc.attributes;
            if (doc.DOCID === docid){
              path = path + projectid + '-' + doc.DOCTYPEID + '-' + docid;
              $location.path(path);
            }
          });
        }

       $scope.go = function ( direction ) {
         var path = '/project/';
         switch (direction){
           case 'foward':
              getDocPath(projectDocuments, docid + 1 );
              break;
           case 'back':
              getDocPath(projectDocuments, docid - 1 );
              break;
            case 'edit':
              $location.path('/addDocument/' + projectid);
              break;
            default:
              $location.path(path + projectid);
          }

       };
  }]);
