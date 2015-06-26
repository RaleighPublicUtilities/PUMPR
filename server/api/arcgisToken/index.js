'use strict';

var express = require('express');
var auth = require('../../auth/auth.service');
var controller = require('./arcgisToken.controller');

var router = express.Router();

router.post('/getToken', auth.isAuthenticated(), controller.getToken);


module.exports = router;
