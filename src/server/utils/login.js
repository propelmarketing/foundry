// @flow

import config from 'config';
import Logger from 'server/utils/logger';
import passport from 'server/passport';
import validator from 'validator';

import { getClientRedirect } from 'server/utils/clientRedirect';
import {
  MISSING_USERNAME_PARAMETER,
  ILLEGAL_STATE_EXCEPTION
} from 'server/exception/codes';

const CONTROLLER_CONFIG = config.get('server');
const LOGGER = Logger.get('auth');

/**
 * [description]
 * @param  {[type]} page     [description]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const render = async function (page: string, request: Object, response: Object): Promise<void> {
  const assetsConfig: Object = CONTROLLER_CONFIG.get('assets');

  if (request.user) {
    try {
      const url: string = await getClientRedirect(request);
      return response.redirect(url);
    } catch (e) {
      LOGGER.error(e);
      request.flash('error', e.message);
    }
  }

  let flashes: Object = {};
  if (request.session && request.session.flash) {
    flashes = Object.assign({}, request.session.flash);
    delete request.session.flash;
  }

  return response.render(page, {
    cdn: assetsConfig.get('cdn'),
    agency: request.agency.name,
    flash: flashes
  });
};
export { render };

/**
 * [description]
 * @param  {[type]}   path     [description]
 * @param  {[type]}   request  [description]
 * @param  {[type]}   response [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
const attemptLoginHelper = function (request: Object, response: Object, next: Function, callback: Function): void {
  if (!validator.isEmail(request.body.username)) {
    return callback(MISSING_USERNAME_PARAMETER);
  }

  return passport.authenticate('user', (err, user, info): void => {
    if (err) {
      return callback(err);
    }

    if (!user) {
      return callback(info);
    }

    return request.logIn(user, function () {
      if (request.session) {
        return request.session.save((e): void => {
          if (e) {
            LOGGER.error(e);
            callback(e);
          }
          return callback(null, user);
        });
      }
      return callback(ILLEGAL_STATE_EXCEPTION);
    });
  })(request, response, next);
};
export { attemptLoginHelper };

/**
 * [description]
 * @return {[type]} [description]
 */
const redirectToClientHelper = async function (request: Object, callback: Function): Promise<void> {
  let next: string;
  if (request.body.next) {
    next = decodeURIComponent(request.body.next);
    return callback(null, next);
  }

  if (request.query.next) {
    next = decodeURIComponent(request.query.next);
    return callback(null, next);
  }

  try {
    const url: string = await getClientRedirect(request);
    return callback(null, url);
  } catch (e) {
    return callback(e);
  }
};
export { redirectToClientHelper };
