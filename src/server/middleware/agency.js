// @flow

import AbstractMiddleware from 'server/middleware';
import { getHost, findDomain } from 'server/utils/host';

/**
 *
 */
export default class AgencyMiddleware extends AbstractMiddleware {

  /**
   * [captureAgency description]
   * @param  {[type]}   request  [description]
   * @param  {[type]}   response [description]
   * @param  {Function} next     [description]
   * @return {[type]}            [description]
   */
  captureAgency(request: Object, response: Object, next: Function): void {
    const host: string = getHost(request);
    let name: string = 'thrivehive';
    if (!this.config.agencyBlacklist.includes(host) && host.indexOf('.') !== -1) {
      name = host.split('.')[1];
    }

    const domain: string | null = findDomain(host);
    request.agency = {
      domain,
      host,
      name
    };
    next();
  }

  /**
   * [mount description]
   * @param  {[type]} app [description]
   * @return {[type]}     [description]
   */
  mount(app: Object): void {
    app.use(::this.captureAgency);
  }
}
