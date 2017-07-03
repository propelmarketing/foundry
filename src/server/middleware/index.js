// @flow

import config from 'config';
import error from 'server/utils/error';
import Exception from 'server/exception';
import Logger from 'server/utils/logger';
import models from 'server/models';
import { NOT_YET_IMPLEMENTED, NOT_ALLOWED, NOT_AUTHORIZED } from 'server/exception/codes';

const LOGGER = Logger.get('auth');
const sessionConfig = config.get('server').get('session');

/**
 *
 */
export default class AbstractMiddleware {

  config: Object;
  logger: Object;

  /**
   * [constructor description]
   * @param  {[type]} config [description]
   * @param  {[type]} logger [description]
   * @return {[type]}        [description]
   */
  constructor(config: Object, logger: Object): void {
    this.config = config;
    this.logger = logger;
  }

  /**
   * [app description]
   * @type {[type]}
   */
  mount(app: Object): void {
    throw new Exception(NOT_YET_IMPLEMENTED);
  }
}

/**
 * [description]
 * @param  {[type]}   request  [description]
 * @param  {[type]}   response [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
const validateApiAccess = async function(request: Object, response: Object, next: Function): Promise<void> {
  let apiKey: string;

  const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
  LOGGER.info(`[validateApiAccess] Validating API access for ${ip}`);

  try {

    if (request.body && 'api_key' in request.body) {
      apiKey = request.body.api_key;
      delete request.body.api_key;
    } else if (request.query) {
      apiKey = request.query.api_key;
    }

    // TODO support x-api-key in header/cookie

    const key = await models.ApiKey.findOne({ where: { key: apiKey } });

    if (!key) {
      LOGGER.warn(`[validateApiAccess] Connection attempt for ${ip} was blocked. No valid API key was provided.`);
      throw new Exception(NOT_ALLOWED);
    }

    next();
  } catch (e) {
    error(e, response);
  }
}
export { validateApiAccess };

/**
 * [description]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const validateUserSession = function(request: Object, response: Object): void {
  const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
  LOGGER.info(`[validateUserSession] Validating user session for ${ip}`);

  // If the session was created piror to a password update/reset, then forcibly expire the session
  if (request.session && request.user && (request.session.createTime < request.user.lastPasswordUpdate)) {
    request.user = null;
    return request.session.destroy(function (err) {
      if (err) {
        LOGGER.warn(`[validateUserSession] Failed to destroy session for invalid session: ${err}`);
      }
      response.clearCookie(sessionConfig.get('name'));
      LOGGER.warn(`[validateUserSession] Connection attempt for ${ip} was blocked. The session is no longer valid.`);
      return response.status(NOT_AUTHORIZED.status).send(NOT_AUTHORIZED);
    });
  }

  if (request.user) {
    const user = request.user;
    // If the session is valid, then verify their client access levels
    // If the user is allowed to access the client, then return the username
    LOGGER.info(`[validateUserSession] Checking if user ${user.username} can access ${request.clientName} in (${user.applications})`)
    if (user.applications.includes(request.clientName)) {
      request.session.touch();
      LOGGER.info(`[validateUserSession] ${user.username} is valid`);
      return response.status(200).send({ username: user.username });
    }

    // Otherwise, permanently prevent user access
    LOGGER.warn(
      `[validateUserSession] Connection attempt for ${ip} was blocked. User not permitted to access the current client.`
    );
    return response.status(NOT_ALLOWED.status).send(NOT_ALLOWED);
  }

  LOGGER.warn(`[validateUserSession] Connection attempt for ${ip} was blocked. No valid user session was found.`);
  return response.status(NOT_AUTHORIZED.status).send(NOT_AUTHORIZED);
}
export { validateUserSession };
