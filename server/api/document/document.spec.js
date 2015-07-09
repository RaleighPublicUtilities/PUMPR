'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('GET /api/documents/exists', function() {

  it('should respond exists false with JSON', function(done) {
    request(app)
      .get('/api/documents/exists?filename=102566-CP-2')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.an.instanceOf(Object);
        res.body.should.have.property('filename', '102566-CP-2');
        res.body.should.have.property('folder', 102566);
        res.body.should.have.property('exists', false);
        done();
      });
  });

  it('should respond exists true with JSON', function(done) {
    request(app)
      .get('/api/documents/exists?filename=106387-AB-1')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.an.instanceOf(Object);
        res.body.should.have.property('filename', '106387-AB-1');
        res.body.should.have.property('folder', 106387);
        res.body.should.have.property('exists', true);
        done();
      });
  });

  it('should respond 200 exists false', function(done) {
    request(app)
      .get('/api/documents/exists?filename=1000')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.an.instanceOf(Object);
        res.body.should.have.property('filename', '1000');
        res.body.should.have.property('folder', 1000);
        res.body.should.have.property('exists', false);
        done();
      });
  });

  it('should respond 404 Not Found', function(done) {
    request(app)
      .get('/api/documents/exists?duck=goose')
      .expect(404)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.an.instanceOf(Object);
        res.body.should.have.property('error', 'File Not Found');
        res.body.should.have.property('exists', false);
        done();
      });
  });


});




// describe('GET /api/documents/download', function() {
//
//   it('should respond with JSON array', function(done) {
//     request(app)
//       .get('/api/documents')
//       .expect(200)
//       .expect('Content-Type', /json/)
//       .end(function(err, res) {
//         if (err) return done(err);
//         res.body.should.be.instanceof(Array);
//         done();
//       });
//   });
// });
//
//
// describe('GET /api/documents/:projectid/:documentid', function() {
//
//   it('should respond with JSON array', function(done) {
//     request(app)
//       .get('/api/documents')
//       .expect(200)
//       .expect('Content-Type', /json/)
//       .end(function(err, res) {
//         if (err) return done(err);
//         res.body.should.be.instanceof(Array);
//         done();
//       });
//   });
// });
//
//
// describe('POST /api/documents', function() {
//
//   it('should respond with JSON array', function(done) {
//     request(app)
//       .post('/api/documents')
//       .expect(200)
//       .expect('Content-Type', /json/)
//       .end(function(err, res) {
//         if (err) return done(err);
//         res.body.should.be.instanceof(Array);
//         done();
//       });
//   });
// });
//
//
// describe('POST /api/documents/update/:documentid', function() {
//
//   it('should respond with JSON array', function(done) {
//     request(app)
//       .post('/api/documents')
//       .expect(200)
//       .expect('Content-Type', /json/)
//       .end(function(err, res) {
//         if (err) return done(err);
//         res.body.should.be.instanceof(Array);
//         done();
//       });
//   });
// });
