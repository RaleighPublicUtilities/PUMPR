'use strict';

angular.module('pumprApp')
  .service('projectSearch', ['agsServer.service', function(agsServer.service){

    //Auto fill function for street names
    this.autoFill = function (typed) {
      typed = typed.toUpperCase();


      var projectOptions = {
        layer: 'Project Tracking',
        geojson: false,
        actions: 'query',
        params: {
          f: 'json',
          outFields: 'PROJECTNAME,DEVPLANID,PROJECTID',
          text: typed,
          returnGeometry: false,
          orderByFields: 'PROJECTNAME ASC'
        }
      };
      return agsServer.service.ptMs.request(projectOptions);
    };
    this.getSet = function (array){
      if (!array){
        return [];
      }
      var temp = [];
      for (var i = 0, x = array.length; i < x; i++){
        temp.indexOf(temp[i]) !== -1 ? array : temp.push(array[i]);
      }
      return temp;
    }

}]); //ProjectSearch
