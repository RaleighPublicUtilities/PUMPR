'use strict';

angular.module('pumprApp')
  .controller('UploadCtrl', ['$scope', 'FileUploader', 'Auth', function($scope, FileUploader, Auth) {
    $scope.loadStatus = {
      addFile: {
        status: false,
        message: 'Please check fields file name incorrect'
      }
    };

    $scope.uploadSuccess = '';

    $scope.uploader = $scope.uploader = new FileUploader({
      url: '/api/documents',
      headers: Auth.setAuthHeader(),
      removeAfterUpload: true
    });




    // FILTERS

  //Checks for correct naming convention
  $scope.uploader.filters.push({
      name: 'checkName',
      fn: function(item, options) {
        var re = /[0-9]{6}-[A-Z]{2}-[0-9]*/;
        if(re.test(options.formData.newName)){
          console.log('Passed RegEx');
          return options.formData.newName;
        }
        else {
          $scope.loadStatus.addFile.message = 'Invalid File Name: ' + options.formData.newName;
          console.log('Failed RegEx: ' + options.formData.newName);
          return false;
        }
      }
    });

  //Check for correct file type (PDF)
  $scope.uploader.filters.push({
      name: 'checkFileType',
      fn: function(item) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        $scope.loadStatus.addFile.message = 'Invalid File Type: ' + type + ', please select a different file.';
        return '|pdf|PDF|TIF|tif|tiff|TIFF'.indexOf(type) !== -1;
      }
    });

    // CALLBACKS

    $scope.uploader.onWhenAddingFileFailed = function() {
      $scope.uploadSuccess = '';
      $scope.loadStatus.addFile.status = true;
    };
    // $scope.uploader.onAfterAddingFile = function(fileItem) {
    //   console.info('onAfterAddingFile', fileItem);
    // };
    // $scope.uploader.onAfterAddingAll = function(addedFileItems) {
    //   console.info('onAfterAddingAll', addedFileItems);
    // };
    $scope.uploader.onBeforeUploadItem = function(item) {
      console.log(item);
      if (item.file.type === 'application/pdf'){
        item.file.name = item.formData.newName + '.pdf';
      }
      else if (item.file.type === 'image/tiff'){
        item.file.name = item.formData.newName + '.TIF';
      }
      // console.log(item);
      return item;
    };
    // $scope.uploader.onProgressItem = function(fileItem, progress) {
    //   console.info('onProgressItem', fileItem, progress);
    // };
    // $scope.uploader.onProgressAll = function(progress) {
    //   console.info('onProgressAll', progress);
    // };
    $scope.uploader.onSuccessItem = function(fileItem) {
      // console.info('onSuccessItem', fileItem, response, status, headers);
      //Dirty hack needs to be fixed in future
      $scope.uploadSuccess = fileItem.isSuccess && 'Upload Successful';
    };
    // $scope.uploader.onErrorItem = function(fileItem, response, status, headers) {
    //   console.info('onErrorItem', fileItem, response, status, headers);
    // };
    // $scope.uploader.onCancelItem = function(fileItem, response, status, headers) {
    //   console.info('onCancelItem', fileItem, response, status, headers);
    // };
    $scope.uploader.onCompleteItem = function(fileItem) {
      // console.info('onCompleteItem', fileItem, response, status, headers);
      //Dirty hack needs to be fixed in future
      $scope.uploadSuccess = fileItem.isSuccess && 'Upload Successful';
    };

  }]);
