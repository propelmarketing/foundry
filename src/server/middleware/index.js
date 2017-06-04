// @flow

import Exception from 'server/exception';
import { NOT_YET_IMPLEMENTED } from 'server/exception/codes';

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
const ensureLoggedIn = function(request: Object, response: Object, next: Function): void {
  if (request.user) {
    return next();
  }

  return response.redirect('/login');
}
export { ensureLoggedIn };
