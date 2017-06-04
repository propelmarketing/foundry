// @flow

import bodyParser from 'body-parser';
import config from 'config';
import express from 'express';

import ErrorMiddleware from 'server/middleware/error';
import SessionMiddleware from 'server/middleware/session';
import StaticMiddleware from 'server/middleware/static';

import IndexController from 'server/controllers';

import Logger from 'server/utils/logger';
import session from 'express-session';

/**
 *
 */
export default class Server {

  app: Object;
  config: Object;
  logger: Object;

  /**
   *
   */
  constructor(): void {
    this.config = config.get('server');

    try {
      this.configure();

      // Initialize the express server
      this.app = express();

      // Mount middleware
      this.middleware();

      // Mount controllers
      this.controllers();
    } catch (e) {
      if (this.logger) {
        this.logger.error(e);
      } else {
        console.error(e);
      }
      this.destroy();
      throw e;
    }
  }

  /**
   *
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
   *
   */
  controllers(): void {
    const indexController = new IndexController(this.config, this.logger);
    indexController.mount(this.app);
  }

  /**
   *
   */
  destroy(): void {
    this.removeEventListeners();
  }

  /**
   *
   */
  middleware(): void {
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(bodyParser.json());

    // BEGIN CUSTOM TH SESSION CONFIG
    const sessionConfig = this.config.get('session');
    if (!process.env.__DEV__) {
      // TODO enabled redis store
    }
    // END CUSTOM TH SESSION CONFIG

    const sessionMiddleware = new SessionMiddleware(this.config, this.logger);
    sessionMiddleware.mount(this.app, sessionConfig);

    const staticMiddleware = new StaticMiddleware(this.config, this.logger);
    staticMiddleware.mount(this.app);

    const errorMiddleware = new ErrorMiddleware(this.config, this.logger);
    errorMiddleware.mount(this.app);
  }

  /**
   * [callback description]
   * @type {Function}
   */
  start(callback: Function | null = null): void {
    if (!this.app) {
      throw new Error('Cannot start server: the express instance is not defined');
    }

    const httpConfig = this.config.get('http');
    this.app.listen(httpConfig.get('port'), httpConfig.get('hostname'), httpConfig.get('backlog'), () => {
      if (callback != null) {
        callback();
      }
      const message = `Server listening at ${httpConfig.get('hostname')}:${httpConfig.get('port')}...`;
      this.logger.info(message);
    });
  }

  /**
   *
   */
  stop(callback: Function | null = null): void {
    if (this.app && this.app.server) {
      this.app.server.close(() => {
        if (callback != null && typeof callback === 'function') {
          callback();
        }
        this.logger.info(`Server (${this.config.hostname}:${this.config.port}) stopping...`);
      });
    }
    this.destroy();
  }

  /**
   *
   */
  sigIntHandler(): void {
    if (this.logger) {
      this.logger.info('Captured ctrl-c');
    }

    this.stop();
    process.exit(1);
  }

  /**
   *
   */
  removeEventListeners(): void {
    process.removeListener('SIGINT', this.boundSigIntHandler);
    process.removeListener('uncaughtException', this.boundUncaughtExceptionHandler);
  }

  /**
   *
   */
  unhandledExceptionHandler(e: Error): void {
    if (this.logger) {
      this.logger.error(`Unhandled Exception. ${e}`);
    }
  }
}
