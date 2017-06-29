// @flow

import error from 'server/utils/error';
import Exception from 'server/exception';
import Logger from 'server/utils/logger';
import validator from 'validator';

import { welcomeNewAccount } from 'server/sendgrid/index';
import { VALIDATION_ERROR } from 'server/exception/codes';

const LOGGER = Logger.get('sendgrid');


  /**
   * [request description]
   * @type {[type]}
   */
const sendNewAccountEmail = async function (request: Object, response: Object): Promise<void> {
  LOGGER.info('[sendNewAccountEmail] New account email initiated');
  if (!request.body.email) {
    throw new Exception(VALIDATION_ERROR('Email is required'));
  }

  try {
    const email: string = request.body.email.toLowerCase();
    if (!validator.isEmail(email)) {
      throw new Exception(VALIDATION_ERROR(`In valid email: ${email}`));
    }

    LOGGER.info(`[sendNewAccountEmail] request to send new account email to ${email}`);

    const password = 'To login to your new account, please reset your password by selecting \'Forgot Password\' on ' +
      'the login page';
    welcomeNewAccount(request, email, email, password);

    const msg: string = `Successfully sent welcome email to ${email}`;
    LOGGER.info(`[sendNewAccountEmail] ${msg}`);
    return response.json({ message: `${msg}` });
  } catch (e) {
    return error(e, response);
  }
};

export { sendNewAccountEmail };
