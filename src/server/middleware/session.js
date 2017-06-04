// @flow

import session from 'express-session';
import AbstractMiddleware from 'arbiter/middleware';

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
