'use strict';

var mssql = require('mssql');

var psVideo = new mssql.PreparedStatement();
psVideo.input('param', mssql.VarChar(10));
psVideo.prepare("SELECT * FROM vwStorehouseVideos WHERE ML_NAME = @param");


var psImages = new mssql.PreparedStatement();
psImages.input('param', mssql.Int);
psImages.prepare("SELECT * FROM vwStorehouseImages WHERE MLI_ID = @param");

module.exports = {
  psVideo: psVideo,
  psImages: psImages
};
