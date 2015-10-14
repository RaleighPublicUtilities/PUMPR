/**
 * mapLayers Service
 * @namespace Service/Factory
 * @desc Contains all map layers
 */

(function(){
'use strict';

  angular
    .module('pumprApp')
    .factory('mapLayers', mapLayers);

  function mapLayers() {
    var raleighImagery = {
      name: 'Raleigh Imagery',
      url: 'http://api.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}.png?access_token={token}',
      type: 'xyz',
      layerParams: {
        token: 'pk.eyJ1IjoiY3R3aGl0ZSIsImEiOiItb0dqdUlZIn0.4Zb1DGESXnx0ePxMVLihZQ',
        mapId: 'ctwhite.mdf6egjp'
      }
    };

    var raleighTerrain = {
      name: 'Raleigh Terrain',
      url: 'https://{s}.tiles.mapbox.com/v4/{mapId}/{z}/{x}/{y}.png?access_token={token}',
      type: 'xyz',
      layerParams: {
        token: 'pk.eyJ1IjoiY3R3aGl0ZSIsImEiOiItb0dqdUlZIn0.4Zb1DGESXnx0ePxMVLihZQ',
        mapId: 'ctwhite.g8n5fjjp'
      }
    };

    var projects = {
      name: 'Project Tracking',
      type: 'agsDynamic',
      url: 'http://maps.raleighnc.gov/arcgis/rest/services/PublicUtility/ProjectTracking/MapServer/',
      legend: 'http://maps.raleighnc.gov/arcgis/rest/services/PublicUtility/ProjectTracking/MapServer/legend?f=pjson',
      visible: false,
      layerOptions: {
        layers: [1],
        opacity: 0.4,
        attribution: 'Copyright:© 2015 City of Raleigh',
        position: 'back'
      }
    };

    var sewer = {
      name: 'Sewer Collection Network',
      type: 'agsDynamic',
      url: 'http://maps.raleighnc.gov/arcgis/rest/services/PublicUtility/SewerExternal/MapServer/',
      legend: 'http://maps.raleighnc.gov/arcgis/rest/services/PublicUtility/SewerExternal/MapServer/legend?f=pjson',
      visible: true,
      layerOptions: {
        layers: [0,1,2,3,4],
        opacity: 1,
        attribution: 'Copyright:© 2015 City of Raleigh',
        position: 'back'
      }
    };

    var water = {
      name: 'Water Distribution Network',
      type: 'agsDynamic',
      url: 'http://maps.raleighnc.gov/arcgis/rest/services/PublicUtility/WaterDistribution/MapServer/',
      legend: 'http://maps.raleighnc.gov/arcgis/rest/services/PublicUtility/WaterDistribution/MapServer/legend?f=pjson',
      visible: true,
      layerOptions: {
        layers: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
        opacity: 1,
        attribution: 'Copyright:© 2015 City of Raleigh',
        position: 'back'
      }
    };

    var reuse = {
      name: 'Reuse Distribution Network',
      type: 'agsDynamic',
      url: 'http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/ReclaimedDistribution/MapServer/',
      visible: true,
      layerOptions: {
        layers: [0,1,2,3,4,5,6,7,8,9,10,11],
        opacity: 1,
        attribution: 'Copyright:© 2015 City of Raleigh',
        position: 'back'
      }
    };

    var cip = {
      name: 'Active CIP Projects',
      type: 'agsDynamic',
      url: 'http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/RPUD_Projects/MapServer/',
      legend: 'http://gis.raleighnc.gov/arcgis/rest/services/PublicUtility/RPUD_Projects/MapServer/legend',
      visible: false,
      layerOptions: {
        layers: [0],
        opacity: 1,
        attribution: 'Copyright:© 2015 City of Raleigh',
        position: 'back'
      }
    };

    var detailsIntersections = {
      name: 'Detailed Intersections',
      type: 'agsDynamic',
      url: 'http://maps.raleighnc.gov/arcgis/rest/services/PublicUtility/ProjectTracking/MapServer/',
      visible: false,
      layerOptions: {
        layers: [0],
        opacity: 1,
        attribution: 'Copyright:© 2015 City of Raleigh',
        position: 'back'
      }
    };

    var parcels = {
      name: 'Parcels',
      type: 'agsDynamic',
      url: 'http://maps.raleighnc.gov/arcgis/rest/services/Parcels/MapServer/',
      visible: false,
      layerOptions: {
        layers: ['*'],
        opacity: 1,
        attribution: 'Copyright:© 2015 City of Raleigh',
        position: 'back'
      }
    };

    var vehicles = {
      name: 'Vehicles',
      type: 'agsDynamic',
      url: 'http://geodevapplv1:6080/arcgis/rest/services/Networkfleet/MapServer/',
      visible: false,
      layerOptions: {
        layers: [0],
        opacity: 1,
        attribution: 'Copyright:© 2015 City of Raleigh',
        position: 'back'
      }
    };

    var service = {
      baselayers: {
        raleighImagery: raleighImagery,
        raleighTerrain: raleighTerrain
      },
      overlays: {
        cip: cip,
        detailsIntersections: detailsIntersections,
        parcels: parcels,
        projects: projects,
        reuse: reuse,
        sewer: sewer,
        vehicles: vehicles,
        water: water
      }
    };

    return service;

  }
})();
