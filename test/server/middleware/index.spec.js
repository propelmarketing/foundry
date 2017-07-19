// @flow

import bunyan from 'bunyan';
import chai from 'chai';
import config from 'config';
import sinon from 'sinon';

import models from 'server/models';
import AbstractMiddleware, {
  ensureLoggedIn,
  validateApiAccess,
  validateClientAccess,
  validateUserSession
} from 'server/middleware';

// TEST DATA
const TEST_CONFIG = config.get('server');
const LOGGER: Object = {
  error() {},
  info() {},
  warn() {}
};
const RESPONSE: Object = {
  json() {},
  redirect() {},
  send() {},
  status() {}
};
const USER: Object = {
  username: 'test',
  password: 'test',
  applications: ['portal']
};
// END TEST DATA

describe('AbstractMiddleware', function () {
  it('tests that the middleware can be instantiated', function () {
    let middleware: Object;
    chai.expect(function () {
      middleware = new AbstractMiddleware(TEST_CONFIG, LOGGER);
    }).to.not.throw();
    chai.expect(middleware).to.not.be.undefined;
  });
});

describe('Auth Middleware filters', function () {
  before(function () {
    sinon.stub(bunyan.prototype, 'error');
    sinon.stub(bunyan.prototype, 'info');
    sinon.stub(bunyan.prototype, 'warn');
  });

  after(function () {
    bunyan.prototype.error.restore();
    bunyan.prototype.info.restore();
    bunyan.prototype.warn.restore();
  });

  describe('ensureLoggedIn', function () {
    it('tests that requests are redirected to \'/login\' when no user exists in the request', function () {
      const request: Object = { headers: { 'x-forwarded-for': 'test' } };
      const stubbedRedirect: Function = sinon.stub(RESPONSE, 'redirect');
      const next: Function = function () {};

      ensureLoggedIn(request, RESPONSE, next);
      chai.expect(stubbedRedirect.called).to.equal(true);
      chai.assert(stubbedRedirect.calledWith('/login'));

      stubbedRedirect.restore();
    });

    it('tests that the \'next\' callback is called when a user exists in the request', function () {
      const request: Object = { user: {}, headers: { 'x-forwarded-for': 'test' } };
      const stubbedNext: Function = sinon.stub();

      ensureLoggedIn(request, RESPONSE, stubbedNext);
      chai.expect(stubbedNext.called).to.equal(true);
    });
  });

  describe('validateApiAccess', function () {
    const ApiKey = models.ApiKey;

    let stubbedResponseSend: Function;
    let stubbedResponseStatus: Function;

    beforeEach(function () {
      sinon.stub(ApiKey, 'findOne');
      stubbedResponseSend = sinon.stub(RESPONSE, 'send');
      stubbedResponseStatus = sinon.stub(RESPONSE, 'status');

      stubbedResponseStatus.returns(RESPONSE);
    });

    afterEach(function () {
      stubbedResponseSend.restore();
      stubbedResponseStatus.restore();
      ApiKey.findOne.restore();
    });

    it('tests that DELETE requests that does not include \'api_key\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'DELETE',
        query: {}
      };
      const next: Function = function () {};

      await validateApiAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that DELETE requests that includes \'api_key\' calls the \'next\' callback', async function () {
      const apiKey = 'test';
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'DELETE',
        query: { api_key: apiKey }
      };
      const next: Function = sinon.stub();

      ApiKey.findOne.returns(Promise.resolve({}));

      await validateApiAccess(request, RESPONSE, next);
      chai.expect(next.called).to.equal(true);
    });

    it('tests that GET requests that does not include \'api_key\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'GET',
        query: {}
      };
      const next: Function = function () {};

      await validateApiAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that GET requests that includes \'api_key\' calls the \'next\' callback', async function () {
      const apiKey = 'test';
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'GET',
        query: { api_key: apiKey }
      };
      const next: Function = sinon.stub();

      ApiKey.findOne.returns(Promise.resolve({}));

      await validateApiAccess(request, RESPONSE, next);
      chai.expect(next.called).to.equal(true);
    });

    it('tests that HEAD requests that does not include \'api_key\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'HEAD',
        query: {}
      };
      const next: Function = function () {};

      await validateApiAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that HEAD requests that includes \'api_key\' calls the \'next\' callback', async function () {
      const apiKey = 'test';
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'HEAD',
        query: { api_key: apiKey }
      };
      const next: Function = sinon.stub();

      ApiKey.findOne.returns(Promise.resolve({}));

      await validateApiAccess(request, RESPONSE, next);
      chai.expect(next.called).to.equal(true);
    });

    it('tests that OPTION requests that does not include \'api_key\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'OPTION',
        query: {}
      };
      const next: Function = function () {};

      await validateApiAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that OPTION requests that includes \'api_key\' calls the \'next\' callback', async function () {
      const apiKey = 'test';
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'OPTION',
        query: { api_key: apiKey }
      };
      const next: Function = sinon.stub();

      ApiKey.findOne.returns(Promise.resolve({}));

      await validateApiAccess(request, RESPONSE, next);
      chai.expect(next.called).to.equal(true);
    });

    it('tests that POST requests that does not include \'api_key\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'POST',
        body: {}
      };
      const next: Function = function () {};

      await validateApiAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that POST requests that includes \'api_key\' calls the \'next\' callback', async function () {
      const apiKey = 'test';
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'POST',
        body: { api_key: apiKey }
      };
      const next: Function = sinon.stub();

      ApiKey.findOne.returns(Promise.resolve({}));

      await validateApiAccess(request, RESPONSE, next);
      chai.expect(next.called).to.equal(true);
    });

    it('tests that PUT requests that does not include \'api_key\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'PUT',
        body: {}
      };
      const next: Function = function () {};

      await validateApiAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that PUT requests that includes \'api_key\' calls the \'next\' callback', async function () {
      const apiKey = 'test';
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'PUT',
        body: { api_key: apiKey }
      };
      const next: Function = sinon.stub();

      ApiKey.findOne.returns(Promise.resolve({}));

      await validateApiAccess(request, RESPONSE, next);
      chai.expect(next.called).to.equal(true);
    });
  });

  describe('validateClientAccess', function () {
    const Client = models.Client;

    let stubbedResponseSend: Function;
    let stubbedResponseStatus: Function;

    beforeEach(function () {
      sinon.stub(Client, 'findOne');
      stubbedResponseSend = sinon.stub(RESPONSE, 'send');
      stubbedResponseStatus = sinon.stub(RESPONSE, 'status');

      stubbedResponseStatus.returns(RESPONSE);
    });

    afterEach(function () {
      stubbedResponseSend.restore();
      stubbedResponseStatus.restore();
      Client.findOne.restore();
    });

    it('tests that DELETE requests that does not include \'clientId\' and \'clientSecret\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'DELETE',
        query: {}
      };
      const next: Function = function () {};

      await validateClientAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that DELETE requests that does not include \'clientId\' but includes \'client_seret\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'DELETE',
        query: { clientSecret: 'shhh!' }
      };
      const next: Function = function () {};

      stubbedResponseStatus.returns(RESPONSE);

      await validateClientAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that DELETE requests that includes \'client_id\' but not \'client_secret\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'DELETE',
        query: { client_id: 'test' }
      };
      const next: Function = function () {};

      await validateClientAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that DELETE requests that includes \'client_id\' and \'client_secret\' calls the \'next\' callback', async function () {
      const clientSecret = 'shhh!';
      const clientName = 'testClient';
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'DELETE',
        query: { client_id: 'test', client_secret: clientSecret }
      };
      const next: Function = sinon.stub();

      Client.findOne.returns(Promise.resolve({ name: clientName, clientSecret }));

      await validateClientAccess(request, RESPONSE, next);
      chai.expect(next.called).to.equal(true);
      chai.expect(request.clientName).to.equal(clientName);
    });

    it('tests that GET requests that does not include \'client_id\' and \'client_secret\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'GET',
        query: {}
      };
      const next: Function = function () {};

      await validateClientAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that GET requests that does not include \'client_id\' but includes \'client_secret\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'GET',
        query: { client_secret: 'shhh!' }
      };
      const next: Function = function () {};

      await validateClientAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that GET requests that includes \'client_id\' but not \'client_secret\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'GET',
        query: { client_id: 'test' }
      };
      const next: Function = function () {};

      await validateClientAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that GET requests that includes \'client_id\' and \'client_secret\' calls the \'next\' callback', async function () {
      const clientSecret = 'shhh!';
      const clientName = 'testClient';
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'GET',
        query: { client_id: 'test', client_secret: clientSecret }
      };
      const next: Function = sinon.stub();

      Client.findOne.returns(Promise.resolve({ name: clientName, clientSecret }));

      await validateClientAccess(request, RESPONSE, next);
      chai.expect(next.called).to.equal(true);
      chai.expect(request.clientName).to.equal(clientName);
    });

    it('tests that HEAD requests that does not include \'client_id\' and \'client_secret\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'HEAD',
        query: {}
      };
      const next: Function = function () {};

      await validateClientAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that HEAD requests that does not include \'client_id\' but includes \'client_secret\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'HEAD',
        query: { client_secret: 'shhh!' }
      };
      const next: Function = function () {};

      await validateClientAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that HEAD requests that includes \'client_id\' but not \'client_secret\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'DELETE',
        query: { client_id: 'test' }
      };
      const next: Function = function () {};

      await validateClientAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that HEAD requests that includes \'clientId\' and \'clientSecret\' calls the \'next\' callback', async function () {
      const clientSecret = 'shhh!';
      const clientName = 'testClient';
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'HEAD',
        query: { client_id: 'test', client_secret: clientSecret }
      };
      const next: Function = sinon.stub();

      Client.findOne.returns(Promise.resolve({ name: clientName, clientSecret }));

      await validateClientAccess(request, RESPONSE, next);
      chai.expect(next.called).to.equal(true);
      chai.expect(request.clientName).to.equal(clientName);
    });

    it('tests that OPTION requests that does not include \'clientId\' and \'clientSecret\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'OPTION',
        query: {}
      };
      const next: Function = function () {};

      await validateClientAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that OPTION requests that does not include \'client_id\' but includes \'client_secret\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'OPTION',
        query: { client_secret: 'shhh!' }
      };
      const next: Function = function () {};

      await validateClientAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that OPTION requests that includes \'client_id\' but not \'client_secret\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'OPTION',
        query: { client_id: 'test' }
      };
      const next: Function = function () {};

      await validateClientAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that OPTION requests that includes \'clientId\' and \'clientSecret\' calls the \'next\' callback', async function () {
      const clientSecret = 'shhh!';
      const clientName = 'testClient';
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'OPTION',
        query: { client_id: 'test', client_secret: clientSecret }
      };
      const next: Function = sinon.stub();

      Client.findOne.returns(Promise.resolve({ name: clientName, clientSecret }));

      await validateClientAccess(request, RESPONSE, next);
      chai.expect(next.called).to.equal(true);
      chai.expect(request.clientName).to.equal(clientName);
    });

    it('tests that POST requests that does not include \'clientId\' and \'clientSecret\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'POST',
        body: {}
      };
      const next: Function = function () {};

      await validateClientAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that POST requests that does not include \'client_id\' but includes \'client_secret\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'POST',
        body: { client_secret: 'shhh!' }
      };
      const next: Function = function () {};

      await validateClientAccess(request, RESPONSE, next);
      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that POST requests that includes \'client_id\' but not \'client_secret\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'POST',
        body: { client_id: 'test' }
      };
      const next: Function = function () {};

      await validateClientAccess(request, RESPONSE, next);
      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that POST requests that includes \'client_id\' and \'client_secret\' calls the \'next\' callback', async function () {
      const clientSecret = 'shhh!';
      const clientName = 'testClient';
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'POST',
        body: { client_id: 'test', client_secret: clientSecret }
      };
      const next: Function = sinon.stub();

      Client.findOne.returns(Promise.resolve({ name: clientName, clientSecret }));

      await validateClientAccess(request, RESPONSE, next);
      chai.expect(next.called).to.equal(true);
      chai.expect(request.clientName).to.equal(clientName);
    });

    it('tests that PUT requests that does not include \'clientId\' and \'clientId\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'PUT',
        body: {}
      };
      const next: Function = function () {};

      await validateClientAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that PUT requests that does not include \'clientId\' but includes \'clientId\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'PUT',
        body: { clientSecret: 'shhh!' }
      };
      const next: Function = function () {};

      await validateClientAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that PUT requests that includes \'clientId\' but not \'clientId\' responds with a 403', async function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'PUT',
        body: { client_id: 'test' }
      };
      const next: Function = function () {};

      await validateClientAccess(request, RESPONSE, next);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });

    it('tests that PUT requests that includes \'clientId\' and \'clientId\' calls the \'next\' callback', async function () {
      const clientSecret = 'shhh!';
      const clientName = 'testClient';
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        method: 'PUT',
        body: { client_id: 'test', client_secret: clientSecret }
      };
      const next: Function = sinon.stub();

      Client.findOne.returns(Promise.resolve({ name: clientName, clientSecret }));

      await validateClientAccess(request, RESPONSE, next);
      chai.expect(next.called).to.equal(true);
      chai.expect(request.clientName).to.equal(clientName);
    });
  });

  describe('validateUserSession', function () {
    let stubbedResponseSend: Function;
    let stubbedResponseStatus: Function;

    beforeEach(function () {
      stubbedResponseSend = sinon.stub(RESPONSE, 'send');
      stubbedResponseStatus = sinon.stub(RESPONSE, 'status');

      stubbedResponseStatus.returns(RESPONSE);
    });

    afterEach(function () {
      stubbedResponseSend.restore();
      stubbedResponseStatus.restore();
    });

    it('tests that a request without a valid session returns a 401', function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' }
      };

      validateUserSession(request, RESPONSE);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(401));
    });

    it('tests that a request with a valid session and is allowed to access the client returns a 200 and the username', function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        clientName: 'portal',
        user: USER,
        session: { touch: sinon.stub() }
      };

      validateUserSession(request, RESPONSE);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.assert(stubbedResponseSend.calledWith({ username: USER.username }));
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(200));
    });

    it('tests that a request with a valid session, but is not allowed to access the client, returns a 403', function () {
      const request: Object = {
        headers: { 'x-forwarded-for': 'test' },
        client_name: 'thrivehive',
        user: USER
      };

      validateUserSession(request, RESPONSE);

      chai.expect(stubbedResponseSend.called).to.equal(true);
      chai.expect(stubbedResponseStatus.called).to.equal(true);
      chai.assert(stubbedResponseStatus.calledWith(403), 'Response status must be 403');
    });
  });
});
