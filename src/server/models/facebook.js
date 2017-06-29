// @flow

import Logger from 'server/utils/logger';
import Sequelize from 'sequelize';
import Exception from 'server/exception';
import {
  FACEBOOK_ACCOUNT_EXISTS,
  FACEBOOK_ACCOUNT_LINKED
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
    field: 'facebook_id'
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
const FacebookAccount = function (sequelize: Object): Object {
  const model: Function = sequelize.define('facebook_accounts', SCHEMA, OPTIONS);
  model.associate = function (models: Object): void {
    model.belongsTo(models.User);
  };

  /**
   * [description]
   * @param  {[type]} raw [description]
   * @return {[type]}     [description]
   */
  model.canonicalizeProfile = function (raw: Object): Object {
    const profile = Object.assign({}, raw);
    profile.displayName = raw.name;
    profile.name = { familyName: raw.last_name,
      givenName: raw.first_name,
      middleName: raw.middle_name
    };

    profile.profileUrl = raw.link;

    if (raw.email) {
      profile.emails = [{ value: raw.email }];
    }

    if (raw.picture) {
      if (typeof raw.picture === 'object' && raw.picture.data) {
        // October 2012 Breaking Changes
        profile.photos = [{ value: raw.picture.data.url }];
      } else {
        profile.photos = [{ value: raw.picture }];
      }
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
    LOGGER.info(`[linkUser] Attempting to find Facebook Account #${id}`);
    let facebookAccount: Object = await model.findOne({
      where: { id },
      paranoid: false
    });

    if (facebookAccount) {
      LOGGER.info(`[linkUser] Facebook Account #${id} exists. Getting linked user...`);
      const linkedUser: Object = await facebookAccount.getUser();
      LOGGER.info(`[linkUser] Found linked user ${linkedUser.username}`);
      if (facebookAccount.deletedAt !== null) {
        LOGGER.info(`[linkUser] Facebook Account #${id} was previously deleted. Restoring account...`);
        await model.restore({ where: { facebook_id: id } });
        if (linkedUser.id !== user.id) {
          LOGGER.info(`[linkUser] Linking user ${user.username} to Facebook Account #${id}...`);
          await model.update(
            { user_id: user.id },
            { where: { facebook_id: id } }
          );
        }
      } else if (linkedUser.id === user.id) {
        throw new Exception(FACEBOOK_ACCOUNT_LINKED);
      } else {
        throw new Exception(FACEBOOK_ACCOUNT_EXISTS);
      }
    } else {
      const data: Object = { id, profile, user_id: user.id };
      LOGGER.info(
        `[linkUser] Facebook Account #${id} does not exist. Creating account with user ${user.username}...`
      );
      facebookAccount = await model.create(data);
    }

    LOGGER.info(`[linkUser] [OK] Processing completed for Facebook Account #${id}`);
    return facebookAccount;
  };

  return model;
};

export { SCHEMA };
export default FacebookAccount;
