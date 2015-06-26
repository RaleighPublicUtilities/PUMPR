'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ArcgisTokenSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('ArcgisToken', ArcgisTokenSchema);