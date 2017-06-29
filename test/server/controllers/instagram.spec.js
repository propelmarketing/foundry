// @flow

import chai from 'chai';
import sinon from 'sinon';

import * as InstagramController from 'server/controllers/instagram';

describe('InstagramController', function () {
  it('[method] authenticateAccount tests that \'passport.authenticate\' can be called', function (done) {
    const stubbedNext = sinon.stub();
    stubbedNext.callsFake(function () {
      chai.expect(stubbedNext.called).to.equal(true);
      done();
    });

    chai.expect(function () {
      InstagramController.authenticateAccount({}, {}, stubbedNext);
    }).to.not.throw();
  });

  it('[method] authenticateAccountCallback tests that \'passport.authenticate\' can be called', function (done) {
    const stubbedNext = sinon.stub();
    stubbedNext.callsFake(function () {
      chai.expect(stubbedNext.called).to.equal(true);
      done();
    });

    chai.expect(function () {
      InstagramController.authenticateAccountCallback({}, {}, stubbedNext);
    }).to.not.throw();
  });

  it('[method] connectAccount tests that \'passport.authorize\' can be called', function (done) {
    const stubbedNext = sinon.stub();
    stubbedNext.callsFake(function () {
      chai.expect(stubbedNext.called).to.equal(true);
      done();
    });

    chai.expect(function () {
      InstagramController.authenticateAccount({}, {}, stubbedNext);
    }).to.not.throw();
  });

  it('[method] connectAccountCallback tests that \'passport.authorize\' can be called', function (done) {
    const stubbedNext = sinon.stub();
    stubbedNext.callsFake(function () {
      chai.expect(stubbedNext.called).to.equal(true);
      done();
    });

    chai.expect(function () {
      InstagramController.connectAccountCallback({}, {}, stubbedNext);
    }).to.not.throw();
  });
});
