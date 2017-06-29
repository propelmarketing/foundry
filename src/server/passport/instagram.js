// @flow

import models from 'server/models';
import Exception, { handleAuthError } from 'server/exception';
import {
  GENERAL_ERROR,
  INSTAGRAM_ACCOUNT_NOT_FOUND,
  SOCIAL_OATUH_NOT_CONFIGURED
} from 'server/exception/codes';

/**
 * [instagram description]
 * @return {[type]} [description]
 */
const instagram = function (): Function {
  return async (request, accessToken, refreshToken, profile, done) => {
    try {
      // If the user is authenticated, update/link their user data
      let user = request.user;
      let instagramAccount;
      if (user) {
        instagramAccount = await models.InstagramAccount.linkUser(user, profile);
        if (!instagramAccount) {
          throw new Exception(
            GENERAL_ERROR(`Failed to link the Instagram Account to the user '${user.username}'`)
          );
        }
      } else {
        instagramAccount = await models.InstagramAccount.findOne({ where: { id: profile.id } });
        if (!instagramAccount) {
          throw new Exception(INSTAGRAM_ACCOUNT_NOT_FOUND);
        }
        user = await instagramAccount.getUser();
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
export default instagram;
