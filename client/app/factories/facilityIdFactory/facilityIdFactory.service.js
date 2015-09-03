'use strict';

angular.module('pumprApp')
  .factory('facilityIdFactory', function ($http) {
    // Service logic
    // ...
    var facilityids = {
        wfids: [
          {
            tag: /(WHYD)\d*/,
            name: 'Water Hydrants',
            server: 'waterMs'
          },
          {
            tag: /(WSV)\d*/,
            name: 'Water System Valves',
            server: 'waterMs'
          },
          {
            tag: /(WFIT)\d*/,
            name: 'Water Fittings',
            server: 'waterMs'
          },
          {
            tag: /(WSC)\d*/,
            name: 'Water Service Connections',
            server: 'waterMs'
          },
          {
            tag: /(WSS)\d*/,
            name: 'Water Sampling Stations',
            server: 'waterMs'
          },
          {
            tag: /(WCV)\d*/,
            name: 'Water Control Valves',
            server: 'waterMs'
          },
          {
            tag: /(WNS)\d*/,
            name: 'Water Network Structures',
            server: 'waterMs'
          },
          {
            tag: /(WMN)\d*/,
            name: 'Water Pressure Mains',
            server: 'waterMs'
          },
          {
            tag: /(WGM)\d*/,
            name: 'Water Gravity Mains',
            server: 'waterMs'
          },
          {
            tag: /(WLAT)\d*/,
            name: 'Water Lateral Lines',
            server: 'waterMs'
          }
        ],
        sfids: [
          {
            tag: /(SNS)\d*/,
            name: 'Sewer Pump Stations',
            server: 'sewerMs'
          },
          {
            tag: /(SMH)\d*/,
            name: 'Sewer Manhole',
            server: 'sewerMs'
          },
          {
            tag: /(SFMN)\d*/,
            name: 'Force Main',
            server: 'sewerMs'
          },
          {
            tag: /(SGMN)\d*/,
            name: 'Gravity Sewer',
            server: 'sewerMs'
          },
          {
            tag: /(SLAT)\d*/,
            name: 'Lateral',
            server: 'sewerMs'
          }
        ]
      };


    // Public API here
    return (facilityids);

  });
