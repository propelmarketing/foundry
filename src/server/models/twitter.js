// @flow

import Logger from 'server/utils/logger';
import Sequelize from 'sequelize';
import Exception from 'server/exception';
import {
  TWITTER_ACCOUNT_EXISTS,
  TWITTER_ACCOUNT_LINKED
} from 'server/exception/codes';

const LOGGER = Logger.get('db');

/**
 * Client Model Schema definition
 * see http://docs.sequelizejs.com/manual/tutorial/models-definition.html
 */
const SCHEMA: Object = {
  pk: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id'
  },
  id: {
    type: Sequelize.INTEGER,
    unique: true,
    field: 'twitter_id'
  },
  profile: Sequelize.JSONB
};

const OPTIONS: Object = {
  timestamps: true,
  paranoid: true,
  underscored: true
};

/**
 *
 */
const TwitterAccount = function (sequelize: Object): Object {
  const model: Function = sequelize.define('twitter_accounts', SCHEMA, OPTIONS);
  model.associate = function (models: Object): void {
    model.hasOne(models.User, { as: 'linked_account', foreignKey: 'id' });
  };

  /**
   * [description]
   * @param  {[type]} raw [description]
   * @return {[type]}     [description]
   */
  model.canonicalizeProfile = function (raw: Object): Object {
    const profile = Object.assign({}, raw);

    profile.id = String(raw.id);
    if (raw.id_str) { profile.id = raw.id_str; }
    profile.username = raw.screen_name;
    profile.displayName = raw.name;
    if (raw.email) {
      profile.emails = [{ value: raw.email }];
    }
    profile.photos = [{ value: raw.profile_image_url_https }];

    return profile;
  };

  /**
   * [description]
   * @param  {[type]} username [description]
   * @param  {[type]} profile  [description]
   * @return {[type]}          [description]
   */
  model.linkUser = async function (user: Object, profile: Object): Promise<Object> {
    const id: string = profile.id;
    LOGGER.info(`[linkUser] Attempting to find Twitter Account #${id}`);
    let twitterAccount: Object = await model.findOne({
      where: { id },
      paranoid: false
    });

    if (twitterAccount) {
      LOGGER.info(`[linkUser] Twitter Account #${id} exists. Getting linked user...`);
      const linkedUser: Object = twitterAccount.getUser();
      LOGGER.info(`[linkUser] Found linked user ${linkedUser.username}`);
      if (twitterAccount.deletedAt !== null) {
        LOGGER.info(`[linkUser] Twitter Account #${id} was previously deleted. Restoring account...`);
        await model.restore({ where: { twitter_id: id } });
        if (linkedUser.id === user.id) {
          LOGGER.info(`[linkUser] Linking user ${user.username} to Twitter Account #${id}...`);
          await model.update(
            { user_id: user.id },
            { where: { twitter_id: id } }
          );
        }
      } else if (linkedUser.id === user.id) {
        throw new Exception(TWITTER_ACCOUNT_LINKED);
      } else {
        throw new Exception(TWITTER_ACCOUNT_EXISTS);
      }
    } else {
      const data: Object = { id, profile, user_id: user.id };
      LOGGER.info(
        `[linkUser] Twitter Account #${id} does not exist. Creating account with user ${user.username}...`
      );
      twitterAccount = await model.create(data);
    }

    LOGGER.info(`[linkUser] [OK] Processing completed for Twitter Account #${id}`);
    return twitterAccount;
  };

  return model;
};

export { SCHEMA };
export default TwitterAccount;
