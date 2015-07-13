'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var fs = require('fs');
var path = require('path');

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


describe('GET /api/documents/download', function() {

  it('should respond with 200 JSON exists false', function(done) {
    request(app)
      .get('/api/documents/download?filename=1000')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        res.body.should.have.property('filename', '1000');
        res.body.should.have.property('folder', 1000);
        res.body.should.have.property('exists', false);
        done();
      });
  });

  it('should respond 404 Not Found', function(done) {
    request(app)
      .get('/api/documents/download?duck=goose')
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

  it('should respond 200 file sent', function(done) {
    request(app)
      .get('/api/documents/download?filename=106387-AB-1')
      .expect(200)
      .expect('Content-Type', /pdf/)
      .end(function(err, res) {
        if (err) return done(err);
        res.header.should.be.an.instanceOf(Object);
        res.header.should.have.property('content-length', 850629);
        done();
      });
  });


});


describe('GET /api/documents/:projectid/:documentid', function() {

  it('should respond with JSON', function(done) {
    request(app)
      .get('/api/documents/106387/106387-AB-1')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.an.instanceOf(Object);
        res.body.should.have.property('message', 'Sorry, we cannot find that!');
        done();
      });
  });


  it('should respond 404 with JSON', function(done) {
    request(app)
      .get('/api/documents/10/106387-AB-1')
      .expect(404)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.an.instanceOf(Object);
        res.body.should.have.property('message', 'Sorry, we cannot find that!');
        done();
      });
  });

  it('should respond 404 with HTML', function(done) {
    request(app)
      .post('/api/documents/10/106387-AB-1')
      .expect(404)
      .expect('Content-Type', /html/)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });


});


describe('POST /api/documents', function() {

  it('should respond with 401 with html', function(done) {
    request(app)
      .post('/api/documents')
      .expect(401)
      .expect('Content-Type', /html/)
      .end(function(err, res) {
        if (err) return done(err);
        done();
      });
  });

  // it('should upload PDF with 200 json response', function(done) {
  //   var inputDir = path.resolve(__dirname, '../../../', 'public', 'documents', '102566', '102566-CP-1.pdf');
  //   console.log(inputDir);
  //
  //   var formData = {
  //     my_file: fs.createReadStream(inputDir)
  //   }
  //
  //   request(app)
  //     .post({url:'/api/documents', formData: formData},
  //       function optionalCallback(err, httpResponse, body) {
  //         if (err) {
  //           return console.error('upload failed:', err);
  //         }
  //         console.log('Upload successful!  Server responded with:', body);
  //     })
  //     .expect(200)
  //     // .expect('Content-Type', /json/)
  //     .end(function(err, res) {
  //       if (err) return done(err);
  //       done();
  //     });
  // });
});
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
