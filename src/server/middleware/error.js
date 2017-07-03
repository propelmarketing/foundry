// @flow

import AbstractMiddleware from 'server/middleware';

/**
 * [app description]
 * @type {[type]}
 */
export default class ErrorMiddleware extends AbstractMiddleware {

  /**
   * [app description]
   * @type {[type]}
   */
  mount(app: Object): void {
    app.use((error: any, request: Object, response: Object, next: Function): void => {
      this.logger.info({
        method: request.method,
        url: request.url,
        headers: request.headers
      });

      const assetsConfig = this.config.get('assets');
      const status = ('status' in error) ? error.status : 500;
      const code = ('code' in error) ? error.code : -1;
      this.logger.error(error);
      switch (status) {
        case 400:
          return response.render('pages/error/400', {
            cdn: assetsConfig.get('cdn'),
            agency: request.agency.name,
            message: error.message,
            code
          });
        case 401:
          return response.render('pages/error/401', {
            cdn: assetsConfig.get('cdn'),
            agency: request.agency.name,
            message: error.message,
            code
          });
        case 403:
          return response.render('pages/error/403', {
            cdn: assetsConfig.get('cdn'),
            agency: request.agency.name,
            code
          });
        case 404:
          return response.render('pages/error/404', {
            cdn: assetsConfig.get('cdn'),
            agency: request.agency.name,
            code
          });
        case 500:
        case 501:
          return response.render('pages/error/500', {
            cdn: assetsConfig.get('cdn'),
            agency: request.agency.name,
            code
          });
        default:
          return next();
      }
    });

    app.all('*', (request: Object, response: Object): void => {
      response.render('pages/error/404', {
        cdn: this.config.get('assets').get('cdn'),
        agency: request.agency.name
      });
    });
  }
}
