// @flow

import chai from 'chai';
import sinon from 'sinon';

import * as FacebookController from 'server/controllers/facebook';

describe('FacebookController', function () {
  it('[method] authenticateAccount tests that \'passport.authenticate\' can be called', function (done) {
    const stubbedNext = sinon.stub();
    stubbedNext.callsFake(function () {
      chai.expect(stubbedNext.called).to.equal(true);
      done();
    });

    chai.expect(function () {
      FacebookController.authenticateAccount({}, {}, stubbedNext);
    }).to.not.throw();
  });

  it('[method] authenticateAccountCallback tests that \'passport.authenticate\' can be called', function (done) {
    const stubbedNext = sinon.stub();
    stubbedNext.callsFake(function () {
      chai.expect(stubbedNext.called).to.equal(true);
      done();
    });

    chai.expect(function () {
      FacebookController.authenticateAccountCallback({}, {}, stubbedNext);
    }).to.not.throw();
  });

  it('[method] connectAccount tests that \'passport.authorize\' can be called', function (done) {
    const stubbedNext = sinon.stub();
    stubbedNext.callsFake(function () {
      chai.expect(stubbedNext.called).to.equal(true);
      done();
    });

    chai.expect(function () {
      FacebookController.authenticateAccount({}, {}, stubbedNext);
    }).to.not.throw();
  });

  it('[method] connectAccountCallback tests that \'passport.authorize\' can be called', function (done) {
    const stubbedNext = sinon.stub();
    stubbedNext.callsFake(function () {
      chai.expect(stubbedNext.called).to.equal(true);
      done();
    });

    chai.expect(function () {
      FacebookController.connectAccountCallback({}, {}, stubbedNext);
    }).to.not.throw();
  });
});
