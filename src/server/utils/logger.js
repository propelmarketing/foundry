// @flow

import config from 'config';
import bunyan from 'bunyan';

let instance: Object | null = null;

/**
 * [loggers description]
 * @type {[type]}
 */
export default class Logger {

  loggers: Object = {};

  /**
   * [constructor description]
   * @param  {[type]} config [description]
   * @return {[type]}        [description]
   */
  constructor(): Object {
    if (instance == null) {
      this.loadStreams();
      this.init(config.get('loggers'));
      instance = this;
    }
    return instance;
  }

  /**
   * [init description]
   * @param  {[type]} loggersConfig [description]
   * @return {[type]}        [description]
   */
  init(loggersConfig: Object): void {
    loggersConfig.forEach((logger) => {
      const name = logger.name.toLowerCase();
      this.loggers[name] = bunyan.createLogger(logger);
    });
  }

  /**
   * [get description]
   * @param  {[type]} name [description]
   * @return {[type]}      [description]
   */
  static get(name: string): Object {
    if (!instance) {
      instance = new Logger();
    }

    let loggerName;
    if (name == null) {
      loggerName = 'root';
    } else {
      loggerName = name.toLowerCase();
    }
    return instance.loggers[loggerName];
  }

  /**
   *
   */
  loadStreams(): void {
    // Nothing here yet, but if we want to use custom streams,
    // define them here and reference the custom stream name
    // in the logger config
  }
}
