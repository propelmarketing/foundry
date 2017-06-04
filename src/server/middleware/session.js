// @flow

import session from 'express-session';
import AbstractMiddleware from 'server/middleware';

/**
 *
 */
export default class SessionMiddleware extends AbstractMiddleware {

  /**
   * [mount description]
   * @param  {[type]} app [description]
   * @return {[type]}     [description]
   */
  mount(app: Object, options: Object): void {
    app.use(session(options));
  }
}
