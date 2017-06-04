// @flow

import AbstractController from 'server/controllers';

/**
 *
 */
export default class IndexController extends AbstractController {

  /**
   * [app description]
   * @type {[type]}
   */
  mount(app: Object): void {
    app.get('/', function (request: Object, response: Object): void {
      response.redirect('/login');
    });
  }
}
