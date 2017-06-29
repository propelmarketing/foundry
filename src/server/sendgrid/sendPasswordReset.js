// @flow

import config from 'config';
import SendGrid from 'sendgrid';
import Logger from 'server/utils/logger';
import models from 'server/models';
import { constructPasswordResetEmail } from 'server/utils/sendgrid';

const LOGGER = Logger.get('sendgrid');
const SENDGRID_CONFIG = config.get('sendgrid');

/**
 * [passwordReset description]
 * @return {[type]} [description]
 */
const sendPasswordResetEmail = async function (request: Object, email: string, username: string): Promise<void> {
  const passwordResetToken: Object = await models.PasswordResetToken.getPasswordResetToken(email);
  const sendgrid: Object = SendGrid(SENDGRID_CONFIG.get('apiKey'));
  const encodedToken: string = encodeURIComponent(passwordResetToken.token);
  const emptyRequest: Object = sendgrid.emptyRequest(
    constructPasswordResetEmail(email, encodedToken, request, username)
  );

  await sendgrid.API(emptyRequest);

  LOGGER.info(`Password reset email successfully sent to ${passwordResetToken.email}`);
};

export default sendPasswordResetEmail;
