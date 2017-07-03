// @flow

import Logger from 'server/utils/logger';
import Exception, { handleAuthError } from 'server/exception';
import { USER_NOT_FOUND } from 'server/exception/codes';

const logger = Logger.get('auth');

/**
 * [local description]
 * @return {[type]} [description]
 */
const local = function (User: Function): Function {
  return async (username, password, done) => {
    try {
      const user = await User.findOne({ where: { username } });
      if (!user) {
        logger.info(`User not found for username ${username}`);
        throw new Exception(USER_NOT_FOUND);
      }
      const validPassword = await user.verifyPassword(password);
      if (!validPassword) {
        logger.info(`Password validation failed for user ${username} (validPassword: ${validPassword})`);
        throw new Exception(USER_NOT_FOUND);
      }
      return done(null, user);
    } catch (e) {
      return handleAuthError(e, done);
    }
  };
};

export default local;
