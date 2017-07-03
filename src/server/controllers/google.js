// @flow

import connectAuthHelper from 'server/utils/socialAuth';
import error from 'server/utils/error';
import Logger from 'server/utils/logger';
import models from 'server/models';
import passport from 'server/passport';

import {
  attemptLoginHelper,
  render
} from 'server/utils/login';

const LOGGER = Logger.get('auth');

/**
 * [description]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const apiConnectAccount = async function (request: Object, response: Object): Promise<void> {
  try {
    LOGGER.info('[connectGoogle] Request to link a Google Account intiaited');
    await connectAuthHelper(request, models.GoogleAccount);
    LOGGER.info('[connectGoogle] Request to link a Google Account completed');
    return response.status(201).send({ message: 'Successfully linked Google Account' });
  } catch (e) {
    return error(e, response);
  }
};
export { apiConnectAccount };

/**
 * [description]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const apiDisconnectAccount = async function (request: Object, response: Object): Promise<void> {
  const username = request.params.username;
  try {
    const user: Object = await models.User.findOne({
      where: { username },
      include: [{
        model: models.GoogleAccount
      }]
    });

    await models.GoogleAccount.destroy({
      where: { user_id: user.id }
    });

    return response.status(200).send({ message: 'Successfully disconnected your Google Account' });
  } catch (e) {
    return error(e, response);
  }
};
export { apiDisconnectAccount };

/**
 * [description]
 * @param  {[type]}   request  [description]
 * @param  {[type]}   response [description]
 * @param  {Function} next     [description]
 * @return {[type]}            [description]
 */
const attemptLogin = function (request: Object, response: Object, next: Function): void {
  return attemptLoginHelper(request, response, next, function (err): void {
    if (err) {
      LOGGER.error(err);
      request.flash('error', (typeof err === 'object' && 'message' in err) ? err.message : err);
      return response.redirect('/auth/google/connect');
    }

    return next();
  });
};
export { attemptLogin };

/**
 * [authenticateAccount description]
 * @type {[type]}
 */
const authenticateAccount = passport.authenticate('google', {
  scope: ['profile', 'email']
});
export { authenticateAccount };

/**
 * [authenticateAccountCallback description]
 * @type {[type]}
 */
const authenticateAccountCallback = passport.authenticate('google', {
  failureRedirect: '/auth/google/connect',
  failureFlash: true,
});
export { authenticateAccountCallback };

/**
 * [connectAccount description]
 * @type {[type]}
 */
const connectAccount = passport.authorize('google', {
  scope: ['email', 'profile']
});
export { connectAccount };

/**
 * [connectAccountCallback description]
 * @type {[type]}
 */
const connectAccountCallback = passport.authorize('google', {
  failureRedirect: '/auth/google/connect',
  failureFlash: true
});
export { connectAccountCallback };

/**
 * [description]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const handleSocialAuthFailure = function (request: Object, response: Object): void {
  response.redirect('/login');
};
export { handleSocialAuthFailure };

/**
 * [description]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const renderConnectAccount = async function (request: Object, response: Object): Promise<void> {
  return await render('pages/google/connect', request, response);
};
export { renderConnectAccount };
