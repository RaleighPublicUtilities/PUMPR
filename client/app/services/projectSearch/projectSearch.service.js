'use strict';

angular.module('pumprApp')
  .service('projectSearch', ['agsServer', function(agsServer){

    //Auto fill function for street names
    this.autoFill = function (typed) {
      typed = typed.toUpperCase();

      //Allows apostrophe (single quote) to be searched
      typed = typed.replace("'", "''");

      var projectOptions = {
        layer: 'Project Tracking',
        geojson: false,
        actions: 'query',
        params: {
          f: 'json',
          outFields: 'PROJECTNAME,DEVPLANID,PROJECTID',
          where: "PROJECTNAME like '%" +typed + "%' OR DEVPLANID like '%" +typed + "%' OR PROJECTID like '%" +typed + "%' OR ALIAS like '%" +typed + "%' OR FORMERNAME like'%" +typed + "%'",
          returnGeometry: false,
          orderByFields: 'PROJECTNAME ASC'
        }
      };
      return agsServer.ptMs.request(projectOptions);
    };
    this.getSet = function (array){
      if (!array){
        return [];
      }
      var temp = [];
      for (var i = 0, x = array.length; i < x; i++){
        if (temp.indexOf(temp[i]) === -1){
          temp.push(array[i]);
        }
      }
      return temp;
    };

}]); //ProjectSearch
