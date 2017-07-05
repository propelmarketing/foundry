// @flow

import bodyParser from 'body-parser';
import config from 'config';
import express from 'express';
import flash from 'connect-flash-plus';
import fs from 'fs';
import https from 'https';
import process from 'process';
import swaggerMiddleware from 'swagger-express-middleware';

import swaggerApi from 'configuration/swagger.yml';

import AgencyMiddleware from '<server>/middleware/agency';
import ErrorMiddleware from '<server>/middleware/error';
import LoggingMiddleware from '<server>/middleware/logging';
import StaticMiddleware from '<server>/middleware/static';
import TrackingMiddleware from '<server>/middleware/tracking';
// END CUSTOM TH IMPORTS

import Logger from '<server>/utils/logger';
import router from '<server>/router';

// Enable Newrelic Reporting if the <server> is in a production environment
let newrelic: Object | null = null;
if (process.env.NODE_ENV === 'production') {
  newrelic = require('newrelic');
}

// Allow config mutations
process.env.ALLOW_CONFIG_MUTATIONS = true;

/**
 * [app description]
 * @type {[type]}
 */
export default class <server> {

  app: Function;
  config: Object;
  logger: Object;

  /**
   * [constructor description]
   * @param  {[type]} void [description]
   * @return {[type]}      [description]
   */
  constructor(): void {
    this.config = config.get('<server>');

    try {
      this.configure();

      // Initialize the express <server>
      this.app = express();

      // Mount middleware
      this.middleware();

      // Mount controllers
      this.controllers();

      // Mount error middleware if no routes matched
      this.errorMiddleware();
    } catch (e) {
      if (this.logger) {
        this.logger.error(e);
      } else {
        /* eslint-disable no-console */
        console.error(e);
      }
      this.destroy();
      throw e;
    }
  }

  /**
   * [logger description]
   * @type {[type]}
   */
  configure(): void {
    this.logger = Logger.get('root');

    // Catches ctrl+c event
    this.boundSigIntHandler = ::this.sigIntHandler;
    process.on('SIGINT', this.boundSigIntHandler);

    // Catches uncaught exceptions
    this.boundUncaughtExceptionHandler = ::this.unhandledExceptionHandler;
    process.on('uncaughtException', this.boundUncaughtExceptionHandler);
  }

  /**
   * [indexController description]
   * @type {IndexController}
   */
  controllers(): void {
    this.app.use(router);
  }

  /**
   * [destroy description]
   * @param  {[type]} void [description]
   * @return {[type]}      [description]
   */
  destroy(): void {
    this.removeEventListeners();
  }

  /**
   * [initSwagger description]
   * @param  {[type]} Promse [description]
   * @return {[type]}        [description]
   */
  initSwagger(): Promise<void> {
    return new Promise((resolve, reject) => {
      swaggerMiddleware(swaggerApi, this.app, (error: any, middleware: Object): void => {
        if (error) {
          return reject(error);
        }

        return this.app.use(
          middleware.metadata(),
          middleware.CORS(),
          middleware.files(this.app, {
            apiPath: '/swagger/api',
          }),
          middleware.parseRequest(),
          middleware.validateRequest(),
          middleware.mock()
        );
      });
    });
  }

  /**
   * Attach middleware to the Express app.
   * Note: Order matters here.
   * @param  {[type]}  void [description]
   * @return {Promise}      [description]
   */
  middleware(): void {
    // Initialize body parser before routes or body will be undefined
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));
    this.app.use(bodyParser.json());
    this.app.use(flash({ unsafe: true }));

    // Configure Request logging
    const loggingMiddleware = new LoggingMiddleware(this.config, this.logger);
    loggingMiddleware.mount(this.app);

    // Configure Request logging
    const agencyMiddleware = new AgencyMiddleware(this.config, this.logger);
    agencyMiddleware.mount(this.app);

    // Configure the Express Static middleware
    const staticMiddleware = new StaticMiddleware(this.config, this.logger);
    staticMiddleware.mount(this.app);

    // BEGIN CUSTOM TH MIDDLEWARE
    const trackingMiddleware = new TrackingMiddleware(this.config, this.logger, newrelic);
    trackingMiddleware.mount(this.app);
    // END CUSTOM TH MIDDLEWARE
  }

  /**
   * [errorMiddleware description]
   * @param  {[type]} void [description]
   * @return {[type]}      [description]
   */
  errorMiddleware(): void {
    // Configure the request error handling
    const errorMiddleware = new ErrorMiddleware(this.config, this.logger);
    errorMiddleware.mount(this.app);
  }

  /**
   * [callback description]
   * @type {Function}
   */
  start(callback: Function | null = null): void {
    if (!this.app) {
      throw new Error('Cannot start <server>: the express instance is not defined');
    }

    const cb = () => {
      if (callback != null) {
        callback();
      }
      const message = `<server> listening at ${this.config.get('hostname')}:${this.config.get('port')}...`;
      this.logger.info(message);
    };

    return (this.config.get('secure')) ? this.startHttps(cb) : this.startHttp(cb);
  }

  /**
   * [startHttp description]
   * @param  {[type]} void [description]
   * @return {[type]}      [description]
   */
  startHttp(callback: Function): void {
    return this.app.listen(this.config.get('port'), this.config.get('hostname'), this.config.get('backlog'), callback);
  }

  /**
   * [startHttps description]
   * @param  {[type]} void [description]
   * @return {[type]}      [description]
   */
  startHttps(callback: Function): void {
    this.app.all('*', function (request: Object, response: Object, next: Function) {
      if (request.secure) {
        return next();
      }
      return response.redirect(`https://${request.hostname}:${this.config.get('port')}${request.url}`);
    });
    const sslConfig = this.config.get('ssl');
    const httpsConfig = Object.assign({}, sslConfig, {
      key: fs.readFileSync(sslConfig.get('key')),
      cert: fs.readFileSync(sslConfig.get('cert'))
    });
    return https.create<server>(httpsConfig, this.app)
      .listen(this.config.get('port'), this.config.get('hostname'), this.config.get('backlog'), callback);
  }

  /**
   * [stop description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  stop(callback: Function | null = null): void {
    if (this.app && this.app.<server>) {
      this.app.<server>.close(() => {
        if (callback != null && typeof callback === 'function') {
          callback();
        }
        this.logger.info(`<server> (${this.config.hostname}:${this.config.port}) stopping...`);
      });
    }
    this.destroy();
  }

  /**
   * [sigIntHandler description]
   * @param  {[type]} void [description]
   * @return {[type]}      [description]
   */
  sigIntHandler(): void {
    if (this.logger) {
      this.logger.info('Captured ctrl-c');
    }

    this.stop();
    process.exit(1);
  }

  /**
   * [removeEventListeners description]
   * @param  {[type]} void [description]
   * @return {[type]}      [description]
   */
  removeEventListeners(): void {
    process.removeListener('SIGINT', this.boundSigIntHandler);
    process.removeListener('uncaughtException', this.boundUncaughtExceptionHandler);
  }

  /**
   * [unhandledExceptionHandler description]
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
   */
  unhandledExceptionHandler(e: Error): void {
    if (this.logger) {
      this.logger.error(`Unhandled Exception. ${e}`);
    }
  }
}
