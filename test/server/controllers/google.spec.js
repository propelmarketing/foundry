// @flow

import chai from 'chai';
import sinon from 'sinon';

import * as GoogleController from 'server/controllers/google';

describe('GoogleController', function () {
  it('[method] authenticateAccount tests that \'passport.authenticate\' can be called', function (done) {
    const stubbedNext = sinon.stub();
    stubbedNext.callsFake(function () {
      chai.expect(stubbedNext.called).to.equal(true);
      done();
    });

    chai.expect(function () {
      GoogleController.authenticateAccount({}, {}, stubbedNext);
    }).to.not.throw();
  });

  it('[method] authenticateAccountCallback tests that \'passport.authenticate\' can be called', function (done) {
    const stubbedNext = sinon.stub();
    stubbedNext.callsFake(function () {
      chai.expect(stubbedNext.called).to.equal(true);
      done();
    });

    chai.expect(function () {
      GoogleController.authenticateAccountCallback({}, {}, stubbedNext);
    }).to.not.throw();
  });

  it('[method] connectAccount tests that \'passport.authorize\' can be called', function (done) {
    const stubbedNext = sinon.stub();
    stubbedNext.callsFake(function () {
      chai.expect(stubbedNext.called).to.equal(true);
      done();
    });

    chai.expect(function () {
      GoogleController.authenticateAccount({}, {}, stubbedNext);
    }).to.not.throw();
  });

  it('[method] connectAccountCallback tests that \'passport.authorize\' can be called', function (done) {
    const stubbedNext = sinon.stub();
    stubbedNext.callsFake(function () {
      chai.expect(stubbedNext.called).to.equal(true);
      done();
    });

    chai.expect(function () {
      GoogleController.connectAccountCallback({}, {}, stubbedNext);
    }).to.not.throw();
  });
});
