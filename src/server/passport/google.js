// @flow

import models from 'server/models';
import Exception, { handleAuthError } from 'server/exception';
import {
  GOOGLE_ACCOUNT_NOT_FOUND,
  SOCIAL_OATUH_NOT_CONFIGURED,
  GENERAL_ERROR
} from 'server/exception/codes';

/**
 * [google description]
 * @return {[type]} [description]
 */
const google = function (): Function {
  return async (request, accessToken, refreshToken, profile, done) => {
    try {
      // If the user is authenticated, update/link their user data
      let user = request.user;
      let googleAccount;
      if (user) {
        googleAccount = await models.GoogleAccount.linkUser(user, profile);
        if (!googleAccount) {
          throw new Exception(
            GENERAL_ERROR(`Failed to link the Google Account to the user '${user.username}'`)
          );
        }
      } else {
        googleAccount = await models.GoogleAccount.findOne({ where: { id: profile.id } });
        if (!googleAccount) {
          throw new Exception(GOOGLE_ACCOUNT_NOT_FOUND);
        }
        user = await googleAccount.getUser();
        if (!user) {
          throw new Exception(SOCIAL_OATUH_NOT_CONFIGURED);
        }
      }
      return done(null, user);
    } catch (e) {
      return handleAuthError(e, done);
    }
  };
};
export default google;
