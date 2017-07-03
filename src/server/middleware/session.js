// @flow

import AbstractMiddleware from 'server/middleware';
import config from 'config';
import connectRedis from 'connect-redis';
import session, { MemoryStore } from 'express-session';

const RedisStore = connectRedis(session);

/**
 *
 */
export default class SessionMiddleware extends AbstractMiddleware {

  virtualHosts: Object = {};

  /**
   * [mount description]
   * @param  {[type]} app [description]
   * @return {[type]}     [description]
   */
  mount(app: Object): void {
    app.use(::this.virtualHostSession);
  }

  /**
   * [request description]
   * @type {[type]}
   */
  virtualHostSession(request: Object, response: Object, next: Function): void {
    const agency: Object = request.agency;
    const key: string = agency.name;
    const domain: string = agency.domain;
    let vHostSession: Function | void = this.virtualHosts[key];

    this.logger.info(`[virtualHostSession] Looking up session for virtual host ${key}`);
    if (!domain) {
      this.logger.info(`[virtualHostSession] Invalid domain (${domain}) for virtual host ${key}. Skipping...`);
      return next();
    }

    if (!vHostSession) {
      this.logger.info(`[virtualHostSession] No session cache exists for virtual host ${key}. Creating...`);
      this.logger.info(`[virtualHostSession] Setting domain for cookie to: ${domain}`);

      const newSessionConfig = config.util.cloneDeep(this.config);

      newSessionConfig.cookie.domain = domain;

      if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'qa') {
        newSessionConfig.store = new RedisStore(Object.assign({}, newSessionConfig.store));
      } else {
        newSessionConfig.store = new MemoryStore();
      }

      vHostSession = this.virtualHosts[key] = session(newSessionConfig);
      this.logger.info(`[virtualHostSession] Successfully created session for virtual host ${key}`);
    }
    this.logger.info(`[virtualHostSession] Applying session for virtual host ${key}`);
    return vHostSession(request, response, next);
  }
}
