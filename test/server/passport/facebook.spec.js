// @flow

import chai from 'chai';
import sinon from 'sinon';

import facebook from 'server/passport/facebook';
import models from 'server/models';
import Logger from 'server/utils/logger';

const logger: Object = Logger.get('auth');

// BEGIN TEST DATA
const FacebookAccount: Function = models.FacebookAccount;
const USER: Object = {
  username: 'test@test.com'
};
// END TEST DATA

describe('Facebook Passport Strategy', function () {
  beforeEach(function () {
    sinon.stub(FacebookAccount, 'create');
    sinon.stub(FacebookAccount, 'findOne');
    sinon.stub(logger, 'error');
  });

  afterEach(function () {
    FacebookAccount.create.restore();
    FacebookAccount.findOne.restore();
    logger.error.restore();
  });

  it('expects that the Facebook strategy is registed to passport successfully', function (): void {
    let fn: Function;
    chai.expect(function () {
      fn = facebook();
    }).to.not.throw();
    chai.expect(fn).to.not.be.null;
  });

  it('expects the strategy to fail when no account has been linked to a Facebook account',
    function (done: Function): void {
      const profile: Object = { id: 'fail' };
      const fn: Function = facebook();
      const cb: Function = function (err, result) {
        try {
          chai.expect(err).to.be.null;
          chai.expect(result).to.equal(false);
          done();
        } catch (e) {
          done(e);
        }
      };

      FacebookAccount.findOne.withArgs({
        where: {
          id: profile.id
        }
      }).returns(Promise.resolve(null));

      fn({}, '', '', profile, cb).catch(function (e) {
        done(e);
      });
    }
  );

  it('expects the request to contain the user when a user successfully logins with Facebook',
    function (done: Function): void {
      const profile: Object = { id: 'success' };
      const stubbedGetUser = sinon.stub();
      const account: Object = {
        id: 'success',
        email: 'test@test.com',
        token: 'abc',
        getUser: stubbedGetUser
      };
      const fn: Function = facebook();
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

      FacebookAccount.findOne.withArgs({
        where: {
          id: profile.id
        }
      }).returns(Promise.resolve(account));

      fn({}, '', '', profile, cb).catch(function (e) {
        done(e);
      });
    }
  );

  it('expects a Facebook Account to be successfully created when linking a user',
    function (done: Function): void {
      const profile: Object = {
        id: 'success',
        emails: [{ value: 'test1@test.com' }],
      };
      const stubbedSetUser = sinon.stub();
      const newFacebookAccount: Object = {
        id: 'success',
        email: 'test1@test.com',
        token: 'def',
        setUser: stubbedSetUser
      };
      const fn: Function = facebook();
      const cb: Function = function (err, result) {
        try {
          chai.expect(err).to.be.null;
          chai.expect(result).to.deep.equal(USER);
          done();
        } catch (e) {
          done(e);
        }
      };

      FacebookAccount.findOne.returns(Promise.resolve(null));
      FacebookAccount.create.returns(Promise.resolve(newFacebookAccount));

      fn({ user: USER }, 'def', '', profile, cb).catch(function (e) {
        done(e);
      });
    }
  );
});
