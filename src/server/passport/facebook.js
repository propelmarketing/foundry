// @flow

import models from 'server/models';
import Exception, { handleAuthError } from 'server/exception';
import {
  GENERAL_ERROR,
  FACEBOOK_ACCOUNT_NOT_FOUND,
  SOCIAL_OATUH_NOT_CONFIGURED
} from 'server/exception/codes';

/**
 * [facebook description]
 * @return {[type]} [description]
 */
const facebook = function (): Function {
  return async (request, accessToken, refreshToken, profile, done) => {
    try {
      // If the user is authenticated, update/link their user data
      let user = request.user;
      let facebookAccount;
      if (user) {
        facebookAccount = await models.FacebookAccount.linkUser(user, profile);
        if (!facebookAccount) {
          throw new Exception(
            GENERAL_ERROR(`Failed to link the Facebook Account to the user '${user.username}'`)
          );
        }
      } else {
        facebookAccount = await models.FacebookAccount.findOne({ where: { id: profile.id } });
        if (!facebookAccount) {
          throw new Exception(FACEBOOK_ACCOUNT_NOT_FOUND);
        }
        user = await facebookAccount.getUser();
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
export default facebook;
