// @flow

import config from 'config';
import SendGrid from 'sendgrid';
import Logger from 'server/utils/logger';
import { constructWelcomeEmail } from 'server/utils/sendgrid';

const LOGGER: Object = Logger.get('sendgrid');
const SENDGRID_CONFIG: Object = config.get('sendgrid');

/**
 * Constructs email and sends it through Sendgrid
 * @param { Object } request - request object which contains agency
 * @param { string } email - user email
 * @param { string } [password] - user password
 * @return { Promise<void> } promise which resolves by sending email
 */
const welcomeNewAccount = async (request: Object, email: string, username: string, password: string): Promise<void> => {
  try {
    const sendgrid: Object = SendGrid(SENDGRID_CONFIG.get('apiKey'));
    const emptyRequest: Object = sendgrid.emptyRequest(
      constructWelcomeEmail(request, email, username, password)
    );

    LOGGER.info(`[welcomeNewAccount] Attempting to send email to ${email}...`);
    await sendgrid.API(emptyRequest);

    LOGGER.info(`[welcomeNewAccount] Welcome email successfully sent to ${email}`);
  } catch (e) {
    LOGGER.error(e);
  }
};

export default welcomeNewAccount;
