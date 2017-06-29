// @flow

import chai from 'chai';
import sinon from 'sinon';

import * as TwitterController from 'server/controllers/twitter';

describe('TwitterController', function () {
  it('[method] authenticateAccount tests that \'passport.authenticate\' can be called', function (done) {
    const stubbedNext = sinon.stub();
    stubbedNext.callsFake(function () {
      chai.expect(stubbedNext.called).to.equal(true);
      done();
    });

    chai.expect(function () {
      TwitterController.authenticateAccount({}, {}, stubbedNext);
    }).to.not.throw();
  });

  it('[method] authenticateAccountCallback tests that \'passport.authenticate\' can be called', function (done) {
    const stubbedNext = sinon.stub();
    stubbedNext.callsFake(function () {
      chai.expect(stubbedNext.called).to.equal(true);
      done();
    });

    chai.expect(function () {
      TwitterController.authenticateAccountCallback({}, {}, stubbedNext);
    }).to.not.throw();
  });

  it('[method] connectAccount tests that \'passport.authorize\' can be called', function (done) {
    const stubbedNext = sinon.stub();
    stubbedNext.callsFake(function () {
      chai.expect(stubbedNext.called).to.equal(true);
      done();
    });

    chai.expect(function () {
      TwitterController.authenticateAccount({}, {}, stubbedNext);
    }).to.not.throw();
  });

  it('[method] connectAccountCallback tests that \'passport.authorize\' can be called', function (done) {
    const stubbedNext = sinon.stub();
    stubbedNext.callsFake(function () {
      chai.expect(stubbedNext.called).to.equal(true);
      done();
    });

    chai.expect(function () {
      TwitterController.connectAccountCallback({}, {}, stubbedNext);
    }).to.not.throw();
  });
});
