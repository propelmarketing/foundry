// @flow

import AbstractMiddleware from 'server/middleware';
import config from 'config';
import FacebookStrategy from 'passport-facebook';
import googleStrategy from 'passport-google-oauth';
import LocalStrategy from 'passport-local';
import models from 'server/models';

import passport, * as strategies from 'server/passport';

/**
 *
 */
export default class AuthMiddleware extends AbstractMiddleware {

  /**
   *
   */
  constructor(middlewareConfig: Object, logger: Object): void {
    super(middlewareConfig, logger);
    this.enablePassportStrategies();
  }

  /**
   *
   */
  enablePassportStrategies(): void {
    const authConfig = config.get('auth');

    // serializeUser is used by Passport Session to convert the User object
    // to a single value that can be later deserialized back to a User object.
    passport.serializeUser((user, done) => {
      this.logger.info(`[serializeUser] serializing ${user.id}`);
      done(null, user.id);
    });

    // Given the string id, return the User object back to Passport session
    passport.deserializeUser(async (id, done) => {
      try {
        this.logger.info(`[deserializeUser] attempting deserialization of ${id}`);
        const user = await models.User.findById(id);
        this.logger.info(`[deserializeUser] user is ${user.username}`);
        done(null, user);
      } catch (e) {
        done(e);
      }
    });

    // Initialize the Google auth strategy
    const googleConfig: Object = Object.assign({}, authConfig.get('google'), { passReqToCallback: true });
    passport.use('google', new googleStrategy.OAuth2Strategy(
      googleConfig,
      strategies.google(models.User))
    );

    // Initialize the Facebook auth strategy
    const facebookConfig: Object = Object.assign({}, authConfig.get('facebook'), { passReqToCallback: true });
    passport.use('facebook', new FacebookStrategy(
      facebookConfig,
      strategies.facebook(models.User))
    );

    // Initialize the local auth strategy (username/password)
    passport.use('user', new LocalStrategy(strategies.local(models.User)));
  }

  /**
   * [app description]
   * @type {[type]}
   */
  mount(app: Object): void {
    app.use(passport.initialize());
    app.use(passport.session());
  }
}
