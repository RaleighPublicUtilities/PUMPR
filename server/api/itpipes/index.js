'use strict';

var express = require('express');
var controller = require('./itpipes.controller');

var router = express.Router();

router.get('/', controller.find);
router.get('/video', controller.findVideo);
router.get('/images', controller.findImages);

module.exports = router;
