// @flow

import bunyan from 'bunyan';
import config from 'config';
import createCWStream from 'bunyan-cloudwatch';
import NewRelicStream from 'bunyan-newrelic-stream';
import process from 'process';
import uuidv4 from 'uuid/v4';

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
      this.init(config.get('loggers'));
      instance = this;
    }
    return instance;
  }

  /**
   * [init description]
   * @param  {[type]} handlersConfig [description]
   * @return {[type]}        [description]
   */
  init(loggersConfig: Object): void {
    let loggerConfig;
    const handlersConfig = loggersConfig.get('handlers');
    handlersConfig.forEach((obj) => {
      loggerConfig = Object.assign({}, obj);
      const name = loggerConfig.name.toLowerCase();
      const stream = loggerConfig.stream;

      delete loggerConfig.stream;
      const logger: Object = bunyan.createLogger(loggerConfig);

      this.loadStreams(logger, stream, loggersConfig.get('streams'));
      this.loggers[name] = logger;
    });

    // Enable forwarding logged errors to Newrelic Reporting if the server is in a production environment
    if (process.env.NODE_ENV === 'production') {
      bunyan.createLogger({
        name: '<server>',
        streams: [{
          level: 'error',
          type: 'raw',
          stream: new NewRelicStream()
        }]
      });
    }
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
  loadStreams(logger: Object, name: string, streamsConfig: Object): void {
    let streamConfig;
    switch (name) {
      case 'cloudwatch':
        streamConfig = Object.assign({}, streamsConfig.get('cloudwatch'));
        streamConfig.logStreamName += `-${process.pid}-${uuidv4()}`;
        logger.addStream({
          name: 'cloudwatch',
          type: 'raw',
          stream: createCWStream(Object.assign({}, streamConfig))
        });
        break;
      default:
        break;
    }
  }
}
