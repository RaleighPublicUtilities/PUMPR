// 'use strict';
//
// var should = require('should');
// var app = require('../../app');
// var request = require('supertest');
// var local = require('./arcgisToken.local');
// var token = '';
//
// describe('GET /api/arcgis/getToken', function() {
//
//   it('should respond with JSON array', function(done) {
//     request(app)
//
//       .post({url:'/api/arcgis/getToken', formData: local})
//       .set('Authorization', 'Bearer '  + token)
//       .expect(200)
//       .expect('Content-Type', /json/)
//       .end(function(err, res) {
//         if (err) return done(err);
//         // res.body.should.be.instanceof(Array);
//         done();
//       });
//   });
// });
