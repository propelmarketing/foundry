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
    LOGGER.info('[connectInstagram] Request to link an Instagram Account intiaited');
    await connectAuthHelper(request, models.InstagramAccount);
    LOGGER.info('[connectInstagram] Request to link an Instagram Account completed');
    return response.status(201).send({ message: 'Successfully linked Instagram Account' });
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
        model: models.InstagramAccount
      }]
    });

    await models.InstagramAccount.destroy({
      where: { user_id: user.id }
    });

    return response.status(200).send({ message: 'Successfully disconnected your Instagram Account' });
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
      return response.redirect('/auth/instagram/connect');
    }

    return next();
  });
};
export { attemptLogin };

/**
 * [authenticateAccount description]
 * @type {[type]}
 */
const authenticateAccount = passport.authenticate('instagram', {
  scope: ['basic']
});
export { authenticateAccount };

/**
 * [authenticateAccountCallback description]
 * @type {[type]}
 */
const authenticateAccountCallback = passport.authenticate('instagram', {
  failureRedirect: '/auth/instagram/connect',
  failureFlash: true,
});
export { authenticateAccountCallback };

/**
 * [connectAccount description]
 * @type {[type]}
 */
const connectAccount = passport.authorize('instagram', {
  scope: ['email', 'public_profile']
});
export { connectAccount };

/**
 * [connectAccountCallback description]
 * @type {[type]}
 */
const connectAccountCallback = passport.authorize('instagram', {
  failureRedirect: '/auth/instagram/connect',
  failureFlash: true,
});
export { connectAccountCallback };

/**
 * [description]
 * @param  {[type]} request  [description]
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
const renderConnectAccount = async function (request: Object, response: Object): Promise<void> {
  return await render('pages/instagram/connect', request, response);
};
export { renderConnectAccount };
