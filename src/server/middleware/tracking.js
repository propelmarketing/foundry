// @flow

import AbstractMiddleware from 'server/middleware';

export default class TrackingMiddleware extends AbstractMiddleware {

  trackingConfig: Object;
  newrelic: Object;

  /**
   * [config description]
   * @type {[type]}
   */
  constructor(config: Object, logger: Object, newrelic: Object | null = null): void {
    super(config, logger);
    this.trackingConfig = this.config.get('tracking');
    this.newrelic = newrelic;
  }

  /**
   * [request description]
   * @type {[type]}
   */
  getCredentials(request: Object, response: Object, next: Function): void {
    response.locals.credentials = this.trackingConfig;
    next();
  }

  /**
   * [request description]
   * @type {[type]}
   */
  newRelicClient(request: Object, response: Object, next: Function): void {
    response.locals.nreum = this.newrelic ? this.newrelic.getBrowserTimingHeader() : '';
    next();
  }

  /**
   * [app description]
   * @type {[type]}
   */
  mount(app: Object): void {
    app.use(::this.newRelicClient);
    app.use(::this.getCredentials);
  }
}
