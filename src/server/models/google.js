// @flow

import Logger from 'server/utils/logger';
import Sequelize from 'sequelize';
import Exception from 'server/exception';
import {
  GOOGLE_ACCOUNT_EXISTS,
  GOOGLE_ACCOUNT_LINKED
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
    type: Sequelize.STRING,
    unique: true,
    field: 'google_id'
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
const GoogleAccount = function (sequelize: Object): Object {
  const model: Function = sequelize.define('google_accounts', SCHEMA, OPTIONS);
  model.associate = function (models: Object): void {
    model.belongsTo(models.User);
  };

  /**
   * [description]
   * @param  {[type]} raw [description]
   * @return {[type]}     [description]
   */
  model.canonicalizeProfile = function (raw: Object): Object {
    const profile: Object = Object.assign({}, raw);
    profile.id = raw.sub;
    profile.displayName = raw.email;
    if (raw.family_name || raw.given_name) {
      profile.name = {
        familyName: raw.family_name,
        givenName: raw.given_name
      };
    }
    if (raw.email) {
      profile.emails = [{ value: raw.email, verified: raw.email_verified }];
    }
    if (raw.picture) {
      profile.photos = [{ value: raw.picture }];
    }
    return profile;
  };

  /**
   * [description]
   * @param  {[type]} user [description]
   * @param  {[type]} profile  [description]
   * @return {[type]}          [description]
   */
  model.linkUser = async function (user: Object, profile: Object): Promise<Object> {
    const id: string = profile.id;
    LOGGER.info(`[linkUser] Attempting to find Google Account #${id}`);
    let googleAccount: Object = await model.findOne({
      where: { id },
      paranoid: false
    });

    if (googleAccount) {
      LOGGER.info(`[linkUser] Google Account #${id} exists. Getting linked user...`);
      const linkedUser: Object = await googleAccount.getUser();
      LOGGER.info(`[linkUser] Found linked user ${linkedUser.username}`);
      if (googleAccount.deletedAt !== null) {
        LOGGER.info(`[linkUser] Google Account #${id} was previously deleted. Restoring account...`);
        await model.restore({ where: { google_id: id } });
        if (linkedUser.id !== user.id) {
          LOGGER.info(`[linkUser] Linking user ${user.username} to Google Account #${id}...`);
          await model.update(
            { user_id: user.id },
            { where: { google_id: id } }
          );
        }
      } else if (linkedUser.id === user.id) {
        throw new Exception(GOOGLE_ACCOUNT_LINKED);
      } else {
        throw new Exception(GOOGLE_ACCOUNT_EXISTS);
      }
    } else {
      const data: Object = { id, profile, user_id: user.id };
      LOGGER.info(
        `[linkUser] Google Account #${id} does not exist. Creating account with user ${user.username}...`
      );
      googleAccount = await model.create(data);
    }

    LOGGER.info(`[linkUser] [OK] Processing completed for Google Account #${id}`);
    return googleAccount;
  };

  return model;
};

export { SCHEMA };
export default GoogleAccount;
