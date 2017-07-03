// @flow

import config from 'config';
import ejs from 'ejs';
import Logger from 'server/utils/logger';
import passwordResetTemplate from 'views/emails/passwordReset.ejs';
import passwordResetConfirmationTemplate from 'views/emails/passwordResetConfirmation.ejs';
import welcomeNewAccountTemplate from 'views/emails/welcomeNewAccount.ejs';

const SENDGRID_CONFIG = config.get('sendgrid');
const LOGGER = Logger.get('sendgrid');

/**
 * Gets the appropriate email address to send to
 * @param { string } desiredEmail - The original email intended
 * @return { string } The proper email to send to
 */
const getTargetEmailAddress = (desiredEmail: string): string => {
  const targetEmail: string = SENDGRID_CONFIG.get('sendToDebugAddress') ?
    SENDGRID_CONFIG.get('mailDebugAddress') :
    desiredEmail;
  return targetEmail;
};

/**
 * [getOrigin description]
 * @type {[type]}
 */
const getOrigin = function (request: Object): string {
  return `${SENDGRID_CONFIG.get('defaultProtocol')}://${request.get('host')}`;
};

/**
 * Constructs mail options object for sendgrid emptyRequest method
 * @param  { Object } request - object that contains agency
 * @param { string } email - user email
 * @param { string } subject - email subject
 * @param { string } template - string representation of the template
 * @param { Object } [additionalOptions] - additional options for sendgrid object
 * @return { Object } options object for sendgrid
 */
const constructMail = (
  request: Object, email: string, subject: string, template: string, additionalOptions?: Object
): Object => {
  const targetEmail: string = getTargetEmailAddress(email);
  const cdn: string = config.get('server').get('assets').get('cdn');
  const agency: string = request.agency.name;

  LOGGER.info(`Setting email recipient to ${targetEmail}...`);

  const options = {
    agency,
    agencyName: agency === 'thrivehive' ? 'ThriveHive' : agency,
    cdn,
    email,
  };
  if (additionalOptions) {
    Object.assign(options, additionalOptions);
  }

  return {
    method: 'POST',
    path: '/v3/mail/send',
    body: {
      personalizations: [{
        to: [{
          email: targetEmail
        }],
        subject
      }],
      from: {
        email: `noreply@${options.agency}.com`
      },
      content: [{
        type: 'text/html',
        value: ejs.render(template, options)
      }]
    }
  };
};

/**
 * Constructs email for password reset
 * @param { string } email - user email
 * @param { string } token - user token
 * @param { Object } request - object that contains agency
 * @return { Object } options object for sendgrid
 */
const constructPasswordResetEmail = (email: string, token: string, request: Object, username: string): Object => {
  const origin: string = getOrigin(request);
  const passwordResetUrl = `${origin}/auth/password-reset?token=${token}`;
  const subject = 'Password Reset Instructions';
  const additionalOptions = {
    passwordResetUrl,
    username
  };

  return constructMail(request, email, subject, passwordResetTemplate, additionalOptions);
};

/**
 * Constructs email for password reset confirmation
 * @param { Object } request - object that contains agency
 * @param { string } email - user email
 * @return { Object } options object for sendgrid
 */
const constructPasswordResetConfirmationEmail = (request: Object, email: string, username: string): Object => {
  const subject = 'Password Reset Confirmation';
  const additionalOptions: Object = {
    username
  };

  return constructMail(request, email, subject, passwordResetConfirmationTemplate, additionalOptions);
};


/**
 * Constructs email for new user creation or welcome message
 * @param  { Object } request - object that contains agency
 * @param { string } email - user email
 * @param { string } [password] - user password
 * @return { Object } options object for sendgrid
 */
const constructWelcomeEmail = (request: Object, email: string, username: string, password: string): Object => {
  const origin: string = getOrigin(request);
  const loginUrl: string = `${origin}/login`;
  const subject: string = `Welcome to ${request.agency.name}`;
  const additionalOptions: Object = {
    password,
    username,
    loginUrl
  };

  return constructMail(request, email, subject, welcomeNewAccountTemplate, additionalOptions);
};

export {
  constructPasswordResetEmail,
  constructPasswordResetConfirmationEmail,
  constructWelcomeEmail
};
