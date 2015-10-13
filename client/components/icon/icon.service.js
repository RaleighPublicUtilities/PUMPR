/**
 * Icon Service
 * @namespace Service/Factory
 * @desc Contains all custom leaflet icons
 */

(function(){
  'use strict';
  angular
    .module('pumprApp')
    .factory('icon', icon);

  function icon() {
    var testHydrant = new LeafletIcon('assets/images/testHydrant.png', [20, 30], [10, 25]);
    var flowHydrant = new LeafletIcon('assets/images/flowHydrant.png', [20, 30], [10, 25]);

    var service = {
      test: testHydrant,
      flow: flowHydrant
    };

    return service;

    /**
    * @desc Represents a leaflet icon
    * @constructor
    * @param {String} iconUrl - Url to icon image.
    * @param {Array} iconSize - Icon size.
    * @param {Array} iconAnchor - Position of icon anchor.
    * @return {Object} Icon - LeafletIcon Object
    * @example new LeafletIcon('assets/images/flowHydrant.png', [20, 30], [10, 25]);
    */
    function LeafletIcon(iconUrl, iconSize, iconAnchor) {
      var self = this;
      self.iconUrl = iconUrl;
      self.iconSize = iconSize;
      self.iconAnchor = iconAnchor;
      return self;
    }
  }
})();
