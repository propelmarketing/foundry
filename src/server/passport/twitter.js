// @flow

import models from 'server/models';
import Exception, { handleAuthError } from 'server/exception';
import {
  GENERAL_ERROR,
  TWITTER_ACCOUNT_NOT_FOUND,
  SOCIAL_OATUH_NOT_CONFIGURED
} from 'server/exception/codes';

/**
 * [twitter description]
 * @return {[type]} [description]
 */
const twitter = function (): Function {
  return async (request, accessToken, tokenSecret, profile, done) => {
    try {
      // If the user is authenticated, update/link their user data
      let user = request.user;
      let twitterAccount;
      if (user) {
        twitterAccount = await models.TwitterAccount.linkUser(user, profile);
        if (!twitterAccount) {
          throw new Exception(
            GENERAL_ERROR(`Failed to link the Twitter Account to the user '${user.username}'`)
          );
        }
      } else {
        twitterAccount = await models.TwitterAccount.findOne({ where: { id: profile.id } });
        if (!twitterAccount) {
          throw new Exception(TWITTER_ACCOUNT_NOT_FOUND);
        }
        user = await twitterAccount.getUser();
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
export default twitter;
