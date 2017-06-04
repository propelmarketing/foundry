// @flow

import express from 'express';
import AbstractMiddleware from 'arbiter/middleware';

/**
 *
 */
export default class StaticMiddleware extends AbstractMiddleware {

  /**
   * [mount description]
   * @param  {[type]} app [description]
   * @return {[type]}     [description]
   */
  mount(app: Object): void {
    const assetsConfig = this.config.get('assets');

      // Configure the Rendering Engine
    app.set('views', assetsConfig.get('views'));
    app.set('view engine', assetsConfig.get('templateEngine'));
    if (process.env.__DEV__) {
      this.logger.debug(`Set view location to '${assetsConfig.get('views')}'`);
      this.logger.debug(`Set view engine to '${assetsConfig.get('templateEngine')}'`);
    }

      // Configure express static & sessions
    app.use(express.static(assetsConfig.get('staticRoot')));
    if (process.env.__DEV__) {
      this.logger.debug(`Set static root location to '${assetsConfig.get('staticRoot')}'`);
    }
  }
}
