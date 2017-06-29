// @flow

import chai from 'chai';
import sinon from 'sinon';

import instagram from 'server/passport/instagram';
import models from 'server/models';
import Logger from 'server/utils/logger';

const logger: Object = Logger.get('auth');

// BEGIN TEST DATA
const InstagramAccount: Function = models.InstagramAccount;
const USER: Object = {
  username: 'test@test.com'
};
// END TEST DATA

describe('Instagram Passport Strategy', function () {
  beforeEach(function () {
    sinon.stub(InstagramAccount, 'create');
    sinon.stub(InstagramAccount, 'findOne');
    sinon.stub(logger, 'error');
  });

  afterEach(function () {
    InstagramAccount.create.restore();
    InstagramAccount.findOne.restore();
    logger.error.restore();
  });

  it('expects that the Instagram strategy is registed to passport successfully', function () {
    let fn: Function;
    chai.expect(function () {
      fn = instagram();
    }).to.not.throw();
    chai.expect(fn).to.not.be.null;
  });

  it('expects the strategy to fail when no account has been linked to a Instagram account', function (done) {
    const profile: Object = { id: 'fail' };
    const fn: Function = instagram();
    const cb: Function = function (err, result) {
      try {
        chai.expect(err).to.be.null;
        chai.expect(result).to.equal(false);
        done();
      } catch (e) {
        done(e);
      }
    };

    InstagramAccount.findOne.withArgs({
      where: {
        id: profile.id
      }
    }).returns(Promise.resolve(null));

    fn({}, '', '', profile, cb).catch(function (e) {
      done(e);
    });
  }
  );

  it('expects the request to contain the user when a user successfully logins with Instagram', function (done) {
    const profile: Object = { id: 'success' };
    const stubbedGetUser = sinon.stub();
    const account: Object = {
      id: 'success',
      email: 'test@test.com',
      token: 'abc',
      getUser: stubbedGetUser
    };
    const fn: Function = instagram();
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

    InstagramAccount.findOne.withArgs({
      where: {
        id: profile.id
      }
    }).returns(Promise.resolve(account));

    fn({}, '', '', profile, cb).catch(function (e) {
      done(e);
    });
  }
  );

  it('expects the request to contain the updated user when a user successfuly links a Instagram account', function (done) {
    const profile: Object = {
      id: 'success',
      emails: [{ value: 'test1@test.com' }],
    };
    const stubbedSetUser = sinon.stub();
    const newInstagramAccount: Object = {
      id: 'success',
      email: 'test1@test.com',
      token: 'def',
      setUser: stubbedSetUser
    };
    const fn: Function = instagram();
    const cb: Function = function (err, result) {
      try {
        chai.expect(err).to.be.null;
        chai.expect(result).to.deep.equal(USER);
        done();
      } catch (e) {
        done(e);
      }
    };

    InstagramAccount.findOne.returns(Promise.resolve(null));
    InstagramAccount.create.returns(Promise.resolve(newInstagramAccount));

    fn({ user: USER }, 'def', '', profile, cb).catch(function (e) {
      done(e);
    });
  }
  );
});
