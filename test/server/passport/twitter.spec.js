// @flow

import chai from 'chai';
import sinon from 'sinon';

import twitter from 'server/passport/twitter';
import models from 'server/models';
import Logger from 'server/utils/logger';

const logger: Object = Logger.get('auth');

// BEGIN TEST DATA
const TwitterAccount: Function = models.TwitterAccount;
const USER: Object = {
  username: 'test@test.com'
};
// END TEST DATA

describe('Twitter Passport Strategy', function () {
  beforeEach(function () {
    sinon.stub(TwitterAccount, 'create');
    sinon.stub(TwitterAccount, 'findOne');
    sinon.stub(logger, 'error');
  });

  afterEach(function () {
    TwitterAccount.create.restore();
    TwitterAccount.findOne.restore();
    logger.error.restore();
  });

  it('expects that the Twitter strategy is registed to passport successfully', function () {
    let fn: Function;
    chai.expect(function () {
      fn = twitter();
    }).to.not.throw();
    chai.expect(fn).to.not.be.null;
  });

  it('expects the strategy to fail when no account has been linked to a Twitter account', function (done) {
    const profile: Object = { id: 'fail' };
    const fn: Function = twitter();
    const cb: Function = function (err, result) {
      try {
        chai.expect(err).to.be.null;
        chai.expect(result).to.equal(false);
        done();
      } catch (e) {
        done(e);
      }
    };

    TwitterAccount.findOne.returns(Promise.resolve(null));

    fn({}, '', '', profile, cb).catch(function (e) {
      done(e);
    });
  }
  );

  it('expects the request to contain the user when a user successfully logins with Twitter', function (done) {
    const profile: Object = { id: 'success' };
    const stubbedGetUser = sinon.stub();
    const account: Object = {
      id: 'success',
      email: 'test@test.com',
      token: 'abc',
      getUser: stubbedGetUser
    };
    const fn: Function = twitter();
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

    TwitterAccount.findOne.returns(Promise.resolve(account));

    fn({}, '', '', profile, cb).catch(function (e) {
      done(e);
    });
  }
  );

  it('expects the request to contain the updated user when a user successfuly links a Twitter account', function (done) {
    const profile: Object = {
      id: 'success',
      emails: [{ value: 'test1@test.com' }],
    };
    const stubbedSetUser = sinon.stub();
    const newTwitterAccount: Object = {
      id: 'success',
      email: 'test1@test.com',
      token: 'def',
      setUser: stubbedSetUser
    };
    const fn: Function = twitter();
    const cb: Function = function (err, result) {
      try {
        chai.expect(err).to.be.null;
        chai.expect(result).to.deep.equal(USER);
        done();
      } catch (e) {
        done(e);
      }
    };

    TwitterAccount.findOne.returns(Promise.resolve(null));
    TwitterAccount.create.returns(Promise.resolve(newTwitterAccount));

    fn({ user: USER }, 'def', '', profile, cb).catch(function (e) {
      done(e);
    });
  }
  );
});
