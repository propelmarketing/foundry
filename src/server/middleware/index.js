// @flow

import config from 'config';
import error from 'server/utils/error';
import Exception from 'server/exception';
import Logger from 'server/utils/logger';
import { NOT_YET_IMPLEMENTED, NOT_ALLOWED, NOT_AUTHORIZED } from 'server/exception/codes';

const LOGGER = Logger.get('auth');

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
 * @return [type]              [description]
 */
const ensureLoggedIn = function(request: Object, response: Object, next: Function): void {

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
export { ensureLoggedIn };
export { validateApiAccess };
