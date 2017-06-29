// @flow

import config from 'config';
import SendGrid from 'sendgrid';
import Logger from 'server/utils/logger';
import { constructPasswordResetConfirmationEmail } from 'server/utils/sendgrid';

const LOGGER = Logger.get('auth');

/**
 * [passwordResetConfirmation description]
 * @return {[type]} [description]
 */
const sendPasswordResetConfirmation = async function (request: Object, email: string, username: string): Promise<void> {
  try {
    const sendgrid = SendGrid(config.get('sendgrid').get('apiKey'));
    const emptyRequest = sendgrid.emptyRequest(constructPasswordResetConfirmationEmail(request, email, username));

    await sendgrid.API(emptyRequest);

    LOGGER.info(`Password reset confirmation email successfully sent to ${email}`);
  } catch (e) {
    LOGGER.error(e);
  }
};

export default sendPasswordResetConfirmation;
