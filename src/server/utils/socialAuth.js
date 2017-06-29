// @flow

import {
  GENERAL_ERROR,
  MISSING_PROFILE_PARAMETER,
  MISSING_USERNAME_PARAMETER,
  USER_NOT_FOUND
} from 'server/exception/codes';
import Exception from 'server/exception';
import Logger from 'server/utils/logger';
import models from 'server/models';

const LOGGER = Logger.get('auth');

/**
 * [description]
 * @param  {[type]} connect      [description]
 * @param  {[type]} AccountModel [description]
 * @return {[type]}              [description]
 */
const connectAuthHelper = async function (request: Object, AccountModel: Function): Promise<void> {
  const body: Object = Object.assign({}, request.body);

  const username: string = ('username' in request.params) ? request.params.username : body.username;
  if (!username) {
    throw new Exception(MISSING_USERNAME_PARAMETER);
  }

  let profile: Object = body.profile;
  if (!profile) {
    throw new Exception(MISSING_PROFILE_PARAMETER);
  }

  LOGGER.info(`[connectAuthHelper] Attempting to find user ${username} to link account`);

  const user = await models.User.findOne({ where: { username } });
  if (!user) {
    throw new Exception(USER_NOT_FOUND);
  }

  LOGGER.info(`[connectAuthHelper] User ${username} found`);

  // get the Account basic profile from token
  profile = AccountModel.canonicalizeProfile(profile);

  LOGGER.info(`[connectAuthHelper] Attempting to link user ${username}...`);
  const account = await AccountModel.linkUser(user, profile);
  if (!account) {
    throw new Exception(
      GENERAL_ERROR(`Failed to link the ${AccountModel.toString()} Account to the user '${username}'`)
    );
  }
  LOGGER.info(`[connectAuthHelper] Successfully linked user ${username}`);
};
export { connectAuthHelper as default };
