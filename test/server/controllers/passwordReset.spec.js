// @flow

import chai from 'chai';
import Exception from 'server/exception';
import Logger from 'server/utils/logger';
import models from 'server/models';
import sinon from 'sinon';

import * as PasswordResetController from 'server/controllers/passwordReset';

import * as sendgrid from 'server/sendgrid';
import { VALIDATION_ERROR } from 'server/exception/codes';

// TEST DATA
const LOGGER: Object = {
  debug: sinon.stub(),
  error: sinon.stub(),
  info: sinon.stub(),
  warn: sinon.stub()
};
const MAIL = {
  validMail: { email: 'test@mail.com' },
  invalidMail: { email: 'test' }
};
// END TEST DATA

describe('PasswordResetController', function () {
  before(function () {
    sinon.stub(Logger, 'get');
    Logger.get.returns(LOGGER);
  });

  after(function () {
    Logger.get.restore();
  });

  describe('[method] getForgotPassword', function () {
    it('tests that response.render is called', function () {
      const response = { render: sinon.stub() };
      const request = { agency: 'test' };
      PasswordResetController.getForgotPassword(request, response);
      chai.expect(response.render.called).to.equal(true);
    });
  });

  describe('[method] postForgotPassword', function () {
    beforeEach(function () {
      sinon.stub(models.PasswordResetToken, 'findOne');
      sinon.stub(models.PasswordResetToken, 'create');
      sinon.stub(models.User, 'findOne');
    });

    afterEach(function () {
      models.PasswordResetToken.findOne.restore();
      models.PasswordResetToken.create.restore();
      models.User.findOne.restore();
    });

    it('tests that a validation error is sent when the email is not valid', function () {
      const request = { body: { email: 'fail' } };
      const response = { send: sinon.stub(), status: sinon.stub() };
      const error = new Exception(
        VALIDATION_ERROR('An error occurred while attempting to send a password reset email to fail. (Please provide a valid email address)')
      );

      response.status.returns(response);

      PasswordResetController.postForgotPassword(request, response);
      const responseSendArgs = response.send.args[0];

      chai.expect(response.status.called).to.equal(true);
      chai.expect(response.status.calledWith(error.status)).to.equal(true);
      chai.expect(response.send.called).to.equal(true);
      chai.expect(responseSendArgs[0]).to.deep.equal(error);
    });

    it('tests that \'sendPasswordReset\' is called and the email is returned when the email is valid', async function () {
      const email = 'test@test.com';
      const request = { body: { email } };
      const response = { json: sinon.stub() };
      const stubbedSendPasswordReset = sinon.stub(sendgrid, 'sendPasswordResetEmail');
      const user = { email };

      models.User.findOne.returns(Promise.resolve(user));
      stubbedSendPasswordReset.returns(Promise.resolve(null));

      await PasswordResetController.postForgotPassword(request, response);
      stubbedSendPasswordReset.restore();

      chai.expect(response.json.called).to.equal(true);
      chai.expect(response.json.calledWith({ email })).to.equal(true);
    });
  });
});
