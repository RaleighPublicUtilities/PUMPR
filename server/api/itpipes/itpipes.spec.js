'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');

describe('GET /api/itpipes', function() {

  it('should respond with JSON and itpipes data', function(done) {
    request(app)
      .get('/api/itpipes/?id=SGMN166276')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.an.instanceOf(Object);
        res.body.should.have.property('videos').with.lengthOf(1);
        res.body.should.have.property('images').with.lengthOf(3);
        done();
      });
  });

  it('should respond with JSON and asset not found', function(done) {
    request(app)
      .get('/api/itpipes/?id=SGMN164752')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.an.instanceOf(Object);
        res.body.should.have.property('message', 'Asset Not Found');
        done();
      });
  });

  it('should respond with JSON and asset not found when id not set', function(done) {
    request(app)
      .get('/api/itpipes/?id=')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.an.instanceOf(Object);
        res.body.should.have.property('message', 'Asset Not Found');
        done();
      });
  });


  it('should respond with JSON and asset not found when id is not in correct format', function(done) {
    request(app)
      .get('/api/itpipes/?id=LunchTime')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.an.instanceOf(Object);
        res.body.should.have.property('message', 'Asset Not Found');
        done();
      });
  });

});
