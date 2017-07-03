// @flow

import config from 'config';
import error from 'server/utils/error';
import Exception from 'server/exception';
import Logger from 'server/utils/logger';
import models from 'server/models';
import {
  checkIfInvalidPassword,
  checkIfPasswordsMismatch
}
from 'server/utils/passwordValidation';
import validator from 'validator';

import { sendPasswordResetEmail, sendPasswordResetConfirmation } from 'server/sendgrid';
import { GENERAL_ERROR, VALIDATION_ERROR } from 'server/exception/codes';

const CONTROLLER_CONFIG: Object = config.get('server');
const LOGGER: Object = Logger.get('root');

/**
 * [description]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const getForgotPassword = function (request: Object, response: Object): void {
  const assetsConfig = CONTROLLER_CONFIG.get('assets');
  return response.render('pages/auth/forgotPassword', {
    cdn: assetsConfig.get('cdn'),
    staticRoot: assetsConfig.get('staticRoot'),
    agency: request.agency.name,
  });
};
export { getForgotPassword };

/**
 * Endpoint that serves password reset page
 * @method
 * @param { Object } request - request object
 * @param { Object } response - response object
 * @param { Function } next - Express middleware function
 * @return { Promise<Object> } a promise to response object that renders valid or error page
 */
const getPasswordReset = async function (request: Object, response: Object, next: Function): Promise<void> {
  try {
    LOGGER.info('[getPasswordReset] Initiated password reset');
    const assetsConfig = CONTROLLER_CONFIG.get('assets');
    const token: string = request.query.token;
    if (!token || typeof token !== 'string') {
      throw new Exception(VALIDATION_ERROR('No valid token was provided.'));
    }

    LOGGER.info(`[getPasswordReset] Request provided password reset token ${token}`);
    const tokenData: Object = await models.PasswordResetToken.findOne({
      where: {
        token
      }
    });

    if (!tokenData) {
      throw new Exception(GENERAL_ERROR('Token not found.'));
    }

    if (tokenData.expiresAt < new Date()) {
      throw new Exception(GENERAL_ERROR('Token has expired.'));
    }

    LOGGER.info(`[getPasswordReset] Token ${token} is valid. Granting password reset access`);
    return response.render('pages/auth/passwordReset', {
      cdn: assetsConfig.get('cdn'),
      staticRoot: assetsConfig.get('staticRoot'),
      agency: request.agency.name,
      email: tokenData.email
    });
  } catch (e) {
    return next(e);
  }
};
export { getPasswordReset };

/**
 * Send reset password email or fail silently to prevent confirming to a
 * stranger that a specific email exists in the database
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const postForgotPassword = async function (request: Object, response: Object): Promise<void> {
  const requestBodyEmail: string = request.body.email;
  const email: string = requestBodyEmail && requestBodyEmail.toLowerCase();

  try {
    if (!validator.isEmail(email)) {
      throw new Exception(VALIDATION_ERROR('Please provide a valid email address'));
    }

    LOGGER.info(`[postForgotPassword] Send reset email requested for email ${email}`);

    const user = await models.User.findOne({ where: { username: email } });
    if (user) {
      LOGGER.info(`[postForgotPassword] User exists for email ${email}. Sending password reset email...`);
      sendPasswordResetEmail(request, email, user.username);
    } else {
      LOGGER.info(`[postForgotPassword] User does not exist for email ${email}`);
    }

    return response.json({ email });
  } catch (err) {
    const origMessage = err.message;
    err.message = `An error occurred while attempting to send a password reset email to ${email}. (${origMessage})`;
    return error(err, response);
  }
};
export { postForgotPassword };

/**
 * Endpoint that posts new password and confirmation, validates them and updates DB
 * @method
 * @param { Object } request - request object
 * @param { Object } response - response object
 * @return { Promise<Object> } a promise that returns response object with redirect or error
 */
const postPasswordReset = async function (request: Object, response: Object): Promise<void> {
  const email: string = request.body.email;
  const password: string = request.body.NewPassword;
  const confirmation: string = request.body.ConfirmPassword;

  try {
    if (!email) {
      throw new Exception(GENERAL_ERROR('No email was provided.'));
    }

    LOGGER.info(`[postPasswordReset] User (${email}) attempting password reset...`);

    let validationResult: string | boolean = checkIfInvalidPassword(password);
    if (validationResult) {
      throw new Exception(VALIDATION_ERROR(validationResult));
    }

    validationResult = checkIfPasswordsMismatch(password, confirmation);
    if (validationResult) {
      throw new Exception(VALIDATION_ERROR(validationResult));
    }

    LOGGER.info(`[postPasswordReset] User (${email}) provided a valid password. Looking up user...`);

    const user = await models.User.findOne({ where: { email } });
    if (!user) {
      throw new Exception(GENERAL_ERROR(`Internal Error! Could not find user for ${email}`));
    }

    LOGGER.info(`[postPasswordReset] Updating user ${user.username}'s passwords...`);
    user.update({ password });
    await models.PasswordResetToken.destroy({ where: { email } });

    LOGGER.info(
      `[postPasswordReset] Password for user ${user.username} successfully updated. Sending confirmation email...`
    );

    sendPasswordResetConfirmation(request, email, user.username);

    request.flash('success', 'Password Successfully Updated');
    return response.redirect('/login');
  } catch (e) {
    return error(e, response);
  }
};
export { postPasswordReset };
