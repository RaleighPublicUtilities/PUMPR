/**
 * FacilityId Service
 * @namespace Service/Factory
 * @desc Contains all facility id constructors
 */

(function(){
  'use strict';

  angular
    .module('pumprApp')
    .factory('facilityIdFactory', facilityIdFactory);

    function facilityIdFactory() {

      //Water Services
      var wControlValves = new WaterFacilityId(/(WCV)\d*/, 'Water Control Valves');
      var wFittings = new WaterFacilityId(/(WFIT)\d*/, 'Water Fittings');
      var wGravityMains = new WaterFacilityId(/(WGM)\d*/, 'Water Gravity Mains');
      var wHydrants = new WaterFacilityId(/(WHYD)\d*/, 'Water Hydrants');
      var wLaterals = new WaterFacilityId(/(WLAT)\d*/, 'Water Lateral Lines');
      var wNetStruct = new WaterFacilityId(/(WNS)\d*/, 'Water Network Structures');
      var wPressureMains = new WaterFacilityId(/(WMN)\d*/, 'Water Pressure Mains');
      var wSamplingStation = new WaterFacilityId(/(WSS)\d*/, 'Water Sampling Stations');
      var wServiceConnection = new WaterFacilityId(/(WSC)\d*/, 'Water Service Connections');
      var wSystemValves = new WaterFacilityId(/(WSV)\d*/, 'Water System Valves');

      //Sewer Services
      var ssForceMains = new SewerFacilityId(/(SFMN)\d*/, 'Force Main');
      var ssGravityMain = new SewerFacilityId(/(SGMN)\d*/, 'Gravity Sewer');
      var ssLateral = new SewerFacilityId(/(SLAT)\d*/, 'Lateral');
      var ssManHoles = new SewerFacilityId(/(SMH)\d*/, 'Sewer Manhole');
      var ssPumpStation = new SewerFacilityId(/(SNS)\d*/, 'Sewer Pump Stations');

      var service = {
        wfids: [wControlValves, wFittings, wGravityMains, wHydrants, wLaterals, wNetStruct, wPressureMains, wSamplingStation, wServiceConnection, wSystemValves],
        sfids: [ssForceMains, ssGravityMain, ssLateral, ssManHoles, ssPumpStation]
      };

      return service;

      /**
      * @desc Represents a FacilityId
      * @constructor
      * @param {RegEx} tag - Regular Express that identifies the feature class.
      * @param {string} name - Name of the layer in the Map Service.
      */
      function FacilityId(tag, name, server) {
        var self = this;
        self.tag = tag;
        self.name = name;
        self.server = server;
        return self;
      }

      /**
      * @desc Represents a Water Service FacilityId
      * @constructor
      * @param {RegEx} tag - Regular Express that identifies the feature class.
      * @param {string} name - Name of the layer in the Map Service.
      */
      function WaterFacilityId(tag, name){
        var self = this;
        FacilityId.call(self, tag, name, 'waterMs');
        return self;
      }

      /**
      * @desc Represents a Sewer Service FacilityId
      * @constructor
      * @param {RegEx} tag - Regular Express that identifies the feature class.
      * @param {string} name - Name of the layer in the Map Service.
      */
      function SewerFacilityId(tag, name){
        var self = this;
        FacilityId.call(self, tag, name, 'sewerMs');
        return self;
      }
    }

})();
