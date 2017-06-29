// @flow

import chai from 'chai';
import Exception from 'server/exception';
import Logger from 'server/utils/logger';
import passport from 'server/passport';
import sinon from 'sinon';

import models from 'server/models';
import * as AuthController from 'server/controllers/auth';
import {
  CLIENT_NOT_FOUND,
  ILLEGAL_STATE_EXCEPTION,
  MISSING_USERNAME_PARAMETER
} from 'server/exception/codes';
import * as clientRedirect from 'server/utils/clientRedirect';

// TEST DATA
const LOGGER: Object = {
  debug: sinon.stub(),
  error: sinon.stub(),
  info: sinon.stub(),
  warn: sinon.stub()
};
// END TEST DATA


describe('Auth Controller', function () {
  before(function () {
    sinon.stub(Logger, 'get');
    Logger.get.returns(LOGGER);
  });

  after(function () {
    Logger.get.restore();
  });

  // BEGIN UTIL FUNCTIONS

  describe('[method] getClientsByName', function () {
    beforeEach(function () {
      sinon.stub(models.Client, 'findAll');
    });

    afterEach(function () {
      models.Client.findAll.restore();
    });

    it('tests that an exception is thrown when no clients are found', async function () {
      const clientNames: Array<string> = [];
      models.Client.findAll.returns(Promise.resolve(null));

      try {
        await AuthController.getClientsByName(clientNames);
      } catch (e) {
        chai.expect(e).to.deep.equal(new Exception(CLIENT_NOT_FOUND));
      }
    });

    it('tests that the client models are returned in reversed order for the provided whitelist', async function () {
      const clientNames: Array<string> = ['portal', 'thrivehive'];
      const fakePortal: Object = { name: 'portal' };
      const fakeThrivehive: Object = { name: 'thrivehive' };

      models.Client.findAll.returns(Promise.resolve([fakePortal, fakeThrivehive]));
      const clients: Array<Object> = await AuthController.getClientsByName(clientNames);
      chai.expect(clients).to.deep.equal([fakeThrivehive, fakePortal]);
    });
  });

  // END UTIL FUNCTIONS

  describe('[method] attemptLogin', function () {
    it('tests that an invalid email throws an error', function () {
      const response: Object = { send: sinon.stub(), status: sinon.stub() };
      const request: Object = { body: { username: 'test' } };
      const stubbedNext: Function = sinon.stub();

      response.status.returns(response);

      AuthController.attemptLogin(request, response, stubbedNext);
      const responseSendArgs = response.send.args[0];

      chai.expect(response.send.called).to.equal(true);
      chai.expect(responseSendArgs[0]).to.deep.equal(new Exception(MISSING_USERNAME_PARAMETER));
      chai.expect(response.status.called).to.equal(true);
      chai.expect(response.status.calledWith(MISSING_USERNAME_PARAMETER.status)).to.equal(true);
    });

    it('tests that \'passport.authenticate\' is called when the email is valid', function (done) {
      const response: Object = {};
      const request: Object = { body: { username: 'test@test.com' }, logIn: sinon.stub() };
      const stubbedAuthenticate: Function = sinon.stub(passport, 'authenticate');
      const stubbedNext: Function = sinon.stub();
      const user = { username: 'test@test.com' };

      request.logIn.callsFake(function () {
        stubbedNext();
      });

      stubbedAuthenticate.callsFake(function (arg1, cb) {
        cb(null, user);
        stubbedAuthenticate.restore();
        chai.expect(request.logIn.called).to.equal(true);
        chai.expect(stubbedNext.called).to.equal(true);
        done();
      });

      AuthController.attemptLogin(request, response, stubbedNext);
    });
  });

  describe('[method] login', function () {
    it('tests that \'response.render\' is called when the request does not contain a valid session', async function () {
      const response: Object = { render: sinon.stub() };
      const request: Object = { agency: {}, query: {} };

      await AuthController.login(request, response);
      chai.expect(response.render.called).to.equal(true);
    });

    it('tests that the login attempts to redirect the user if they have a valid session', async function () {
      const client = { url: 'test.com' };
      const response: Object = { redirect: sinon.stub() };
      const request: Object = { user: {}, query: {} };
      const stubbedGetClientRedirect = sinon.stub(clientRedirect, 'getClientRedirect');

      stubbedGetClientRedirect.returns(client.url);

      await AuthController.login(request, response);
      stubbedGetClientRedirect.restore();
      chai.expect(response.redirect.called).to.equal(true);
      chai.expect(response.redirect.calledWith(client.url)).to.equal(true);
    });
  });

  // describe('[method] loginSuccess', function () {
  //   it('tests that an exception is thrown when no session exists', function () {
  //     const request: Object = {};
  //     const response: Object = { send: sinon.stub(), status: sinon.stub() };
  //     const stubbedNext: Function = sinon.stub();
  //
  //     response.status.returns(response);
  //
  //     AuthController.loginSuccess(request, response, stubbedNext);
  //     const responseSendArgs = response.send.args[0];
  //
  //     chai.expect(stubbedNext.called).to.equal(false);
  //     chai.expect(response.status.called).to.equal(true);
  //     chai.expect(response.status.calledWith(ILLEGAL_STATE_EXCEPTION.status)).to.equal(true);
  //     chai.expect(response.send.called).to.equal(true);
  //     chai.expect(responseSendArgs[0]).to.deep.equal(ILLEGAL_STATE_EXCEPTION);
  //   });
  //
  //   it('tests that session.save is called when it exists in the request', function (done) {
  //     const request: Object = { session: { save: sinon.stub() } };
  //     const response: Object = { send: sinon.stub(), status: sinon.stub() };
  //     const stubbedNext: Function = sinon.stub();
  //
  //     request.session.save.callsFake(function (cb: Function) {
  //       cb(null);
  //       chai.expect(stubbedNext.called).to.equal(true);
  //       done();
  //     });
  //
  //     AuthController.loginSuccess(request, response, stubbedNext);
  //     chai.expect(request.session.save.called).to.equal(true);
  //   });
  // });

  // describe('[method] logout', function () {
  //   it('tests that \'request.session.destroy\' is called when there\'s a session and then \'request.logout\' is called', function () {
  //     const response: Object = { cookie: sinon.stub(), redirect: sinon.stub() };
  //     const request: Object = { flash: sinon.stub(), logout: sinon.stub(), session: { destroy: sinon.stub() } };
  //
  //     AuthController.logout(request, response);
  //
  //     chai.expect(request.logout.called).to.equal(true);
  //     chai.expect(response.redirect.called).to.equal(true);
  //     chai.expect(response.redirect.calledWith('/login')).to.equal(true);
  //   });
  // });

  describe('[method] showClientSelection', function () {
    beforeEach(function () {
      sinon.stub(models.Client, 'findAll');
    });

    afterEach(function () {
      models.Client.findAll.restore();
    });

    it('tests that \'next\' is called with an error if \'getClientsByName\' fails', async function () {
      const response: Object = {};
      const request: Object = { agency: {} };
      const stubbedNext: Function = sinon.stub();

      models.Client.findAll.returns(Promise.resolve([]));

      await AuthController.showClientSelection(request, response, stubbedNext);
      const nextArgs = stubbedNext.args[0];

      chai.expect(stubbedNext.called).to.equal(true);
      chai.expect(nextArgs[0]).to.deep.equal(new Exception(CLIENT_NOT_FOUND));
    });

    it('tests that \'getClientsByName\' and \'response.render\' is called when \'getClientsByName\' does not fail', async function () {
      const response: Object = { render: sinon.stub() };
      const request: Object = { agency: 'test' };
      const stubbedNext: Function = sinon.stub();

      models.Client.findAll.returns(Promise.resolve([{ name: 'test', clientUrl: 'https://my.stub.com/' }]));

      await AuthController.showClientSelection(request, response, stubbedNext);

      chai.expect(response.render.called).to.equal(true);
    });
  });

  describe('[method] redirectToClient', function () {
    beforeEach(function () {
      sinon.stub(models.Client, 'findOne');
    });

    afterEach(function () {
      models.Client.findOne.restore();
    });
  });
});
