/**
 * agsDomains Service
 * @namespace Service/Factory
 * @desc Stores table domains
 * @todo Update angular-arcgis-server and use built in control
 */

(function(){
  'use strict';

  angular
    .module('pumprApp')
    .factory('agsDomains', agsDomains);

  function agsDomains() {
    var diameter = [
      Diameter(0.75, '3/4'),
      Diameter(1, '1"'),
      Diameter(1.5, '1 1/2"'),
      Diameter(2, '2"'),
      Diameter(2.5, '2 1/2"'),
      Diameter(3, '3"'),
      Diameter(4, '4"'),
      Diameter(6, '6"'),
      Diameter(8, '8"'),
      Diameter(10, '10"'),
      Diameter(12, '12"'),
      Diameter(14, '14"'),
      Diameter(15, '15"'),
      Diameter(16, '16"'),
      Diameter(18, '18"'),
      Diameter(20, '20"'),
      Diameter(21, '21"'),
      Diameter(24, '24"'),
      Diameter(30, '30"'),
      Diameter(36, '36"'),
      Diameter(42, '42"'),
      Diameter(48, '48"'),
      Diameter(54, '54"'),
      Diameter(57, '57"'),
      Diameter(60, '60"'),
      Diameter(66, '66"'),
      Diameter(72, '72"')
    ];

    var service = {
      diameter: diameter
    };

    return service;

    function Diameter(code, desc) {
      'use strict';

      var self = this;
      if (self instanceof Diameter){
        self.code = code;
        self.desc = desc;
        return self;
      }
      else {
        return new Diameter(code, desc);
      }

    }
  }

})();
