/**
 * Project Document Controller
 * @namespace Controller
 * @desc Controls project document view
 */

(function(){
  'use strict';

  angular
    .module('pumprApp')
    .controller('ProjectDocumentCtrl', ProjectDocumentCtrl);

    ProjectDocumentCtrl.$inject = ['$location', '$sce', 'search', 'Auth'];

  function ProjectDocumentCtrl($location, $sce, search, Auth) {
    var vm = this;
    vm.go = go;
    vm.isLoggedIn = Auth.isLoggedIn;
    vm.documentid = $location.path().split('/')[3];
    vm.documentInfo = vm.documentid.split('-');
    vm.projectname;
    vm.documentDetails;
    vm.projectDocuments;
    vm.projectid = vm.documentInfo[0];
    vm.docid = parseInt(vm.documentInfo[2], 10);
    vm.url = $sce.trustAsResourceUrl('/api/documents/' + vm.projectid + '/' + vm.documentid);

    activate();

    function activate() {
      var offsetHeight = document.getElementById('pageHeightRef').clientHeight;
      document.getElementById("pdfPageView").style.height = (offsetHeight - 200) + 'px';
      return search.documents(vm.projectid)
        .then(setDocument)
        .catch(function(err){
           console.error(err);
        });
    }

    /**
    *@type method
    *@access public
    *@name go
    *@desc Controls the scrolling through documents
    *@param {String} direction - Direction to scroll ('forward', 'back', 'edit')
    *@returns {Redirect}
    */
    function go(direction) {
      var path = '/project/';
      switch (direction){
        case 'foward':
          return getDocPath(vm.projectDocuments, vm.docid + 1 );
          break;
        case 'back':
          return getDocPath(vm.projectDocuments, vm.docid - 1 );
          break;
        case 'edit':
          return $location.path('/addDocument/' + vm.projectid);
          break;
        default:
          return $location.path(path + vm.projectid);
      }
    }

    /**
    *@type method
    *@access private
    *@name getDocPath
    *@desc Set the path to the document page
    *@param {Array} documents - List of project document objects
    *@returns {Redirect}
    */
    function getDocPath(documents, docid) {
      var path = '/project/' + vm.projectid + '/';
      if (docid > documents.length){
        docid = 1;
      }
      else if (docid < 1){
        docid = documents.length
      }
      documents.forEach(function(doc){
        var doc = doc.attributes;
        if (doc.DOCID === docid){
          path = path + vm.projectid + '-' + doc.DOCTYPEID + '-' + docid;
          return $location.path(path);
        }
      });
    }

    /**
    *@type method
    *@access private
    *@name setDocument
    *@desc Prepares view with data from model
    *@param {Object} res - Response from server containing project document information
    *@returns {Object}
    */
    function setDocument(res) {
      if (res.error){
        console.error(err);
      }
      vm.projectDocuments = res;
      vm.projectDocuments.forEach(function(doc){
        if (doc.attributes.DOCID === vm.docid){
          return vm.documentDetails = doc.attributes;
        }
      });
      return vm.documentDetails;
    }

  }
})();
