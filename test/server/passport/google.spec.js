// @flow

import chai from 'chai';
import sinon from 'sinon';

import google from 'server/passport/google';
import models from 'server/models';
import Logger from 'server/utils/logger';

const logger: Object = Logger.get('auth');

// BEGIN TEST DATA
const GoogleAccount: Function = models.GoogleAccount;
const USER: Object = {
  username: 'test@test.com'
};
// END TEST DATA

describe('Google Passport Strategy', function () {
  beforeEach(function () {
    sinon.stub(GoogleAccount, 'create');
    sinon.stub(GoogleAccount, 'findOne');
    sinon.stub(logger, 'error');
  });

  afterEach(function () {
    GoogleAccount.create.restore();
    GoogleAccount.findOne.restore();
    logger.error.restore();
  });

  it('expects that the Google strategy is registed to passport successfully', function () {
    let fn: Function;
    chai.expect(function () {
      fn = google();
    }).to.not.throw();
    chai.expect(fn).to.not.be.null;
  });

  it('expects the strategy to fail when no account has been linked to a Google account', function (done) {
    const profile: Object = { id: 'fail' };
    const fn: Function = google();
    const cb: Function = function (err, result) {
      try {
        chai.expect(err).to.be.null;
        chai.expect(result).to.equal(false);
        done();
      } catch (e) {
        done(e);
      }
    };

    GoogleAccount.findOne.withArgs({
      where: {
        id: profile.id
      }
    }).returns(Promise.resolve(null));

    fn({}, '', '', profile, cb).catch(function (e) {
      done(e);
    });
  }
  );

  it('expects the request to contain the user when a user successfully logins with Google', function (done) {
    const profile: Object = { id: 'success' };
    const stubbedGetUser = sinon.stub();
    const account: Object = {
      id: 'success',
      email: 'test@test.com',
      token: 'abc',
      getUser: stubbedGetUser
    };
    const fn: Function = google();
    const cb: Function = function (err, result) {
      try {
        chai.expect(err).to.be.null;
        chai.expect(result).to.equal(USER);
        done();
      } catch (e) {
        done(e);
      }
    };

    stubbedGetUser.returns(USER);

    GoogleAccount.findOne.withArgs({
      where: {
        id: profile.id
      }
    }).returns(Promise.resolve(account));

    fn({}, '', '', profile, cb).catch(function (e) {
      done(e);
    });
  }
  );

  it('expects the request to contain the updated user when a user successfuly links a Google account', function (done) {
    const profile: Object = {
      id: 'success',
      emails: [{ value: 'test1@test.com' }],
    };
    const stubbedSetUser = sinon.stub();
    const newGoogleAccount: Object = {
      id: 'success',
      email: 'test1@test.com',
      token: 'def',
      setUser: stubbedSetUser
    };
    const fn: Function = google();
    const cb: Function = function (err, result) {
      try {
        chai.expect(err).to.be.null;
        chai.expect(result).to.deep.equal(USER);
        done();
      } catch (e) {
        done(e);
      }
    };

    GoogleAccount.findOne.returns(Promise.resolve(null));
    GoogleAccount.create.returns(Promise.resolve(newGoogleAccount));

    fn({ user: USER }, 'def', '', profile, cb).catch(function (e) {
      done(e);
    });
  }
  );
});
