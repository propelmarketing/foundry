// @flow

import hoistModels from 'server/utils/sequelize';

import ApiKey from 'server/models/apiKey';
import Client from 'server/models/client';
import FacebookAccount from 'server/models/facebook';
import GoogleAccount from 'server/models/google';
import InstagramAccount from 'server/models/instagram';
import PasswordResetToken from 'server/models/passwordResetToken';
import TwitterAccount from 'server/models/twitter';
import User from 'server/models/user';

const models: Object = {
  ApiKey,
  Client,
  FacebookAccount,
  GoogleAccount,
  InstagramAccount,
  PasswordResetToken,
  TwitterAccount,
  User
};

export default hoistModels(models);
