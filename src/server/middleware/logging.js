// @flow

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
  mount(app: Object): void {
    app.use((request: Object, response: Object, next: Function): void => {
      this.logger.info({
        method: request.method,
        url: request.url,
        headers: request.headers
      });
      next();
    });
  }
}
