// @flow

import Logger from 'server/utils/logger';
import Sequelize from 'sequelize';
import Exception from 'server/exception';
import {
  INSTAGRAM_ACCOUNT_EXISTS,
  INSTAGRAM_ACCOUNT_LINKED
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
    field: 'instagram_id'
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
const InstagramAccount = function (sequelize: Object): Object {
  const model: Function = sequelize.define('instagram_accounts', SCHEMA, OPTIONS);
  model.associate = function (models: Object): void {
    model.belongsTo(models.User);
  };

  /**
   * [description]
   * @param  {[type]} raw [description]
   * @return {[type]}     [description]
   */
  model.canonicalizeProfile = function (raw: Object): Object {
    const profile = Object.assign({}, raw, { provider: 'instagram' });

    profile.id = raw.id;
    profile.displayName = raw.full_name;
    profile.name = {
      familyName: raw.last_name,
      givenName: raw.first_name
    };
    profile.username = raw.username;

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
    LOGGER.info(`[linkUser] Attempting to find Instagram Account #${id}`);
    let instagramAccount: Object = await model.findOne({
      where: { id },
      paranoid: false
    });

    if (instagramAccount) {
      LOGGER.info(`[linkUser] Instagram Account #${id} exists. Getting linked user...`);
      const linkedUser: Object = instagramAccount.getUser();
      LOGGER.info(`[linkUser] Found linked user ${linkedUser.username}`);
      if (instagramAccount.deletedAt !== null) {
        LOGGER.info(`[linkUser] Instagram Account #${id} was previously deleted. Restoring account...`);
        await model.restore({ where: { instagram_id: id } });
        if (linkedUser.id !== user.id) {
          LOGGER.info(`[linkUser] Linking user ${user.username} to Instagram Account #${id}...`);
          await model.update(
            { user_id: user.id },
            { where: { instagram_id: id } }
          );
        }
      } else if (linkedUser.id === user.id) {
        throw new Exception(INSTAGRAM_ACCOUNT_LINKED);
      } else {
        throw new Exception(INSTAGRAM_ACCOUNT_EXISTS);
      }
    } else {
      const data: Object = { id, profile, user_id: user.id };
      LOGGER.info(
        `[linkUser] Instagram Account #${id} does not exist. Creating account with user ${user.username}...`
      );
      instagramAccount = await model.create(data);
    }

    LOGGER.info(`[linkUser] [OK] Processing completed for Instagram Account #${id}`);
    return instagramAccount;
  };

  return model;
};

export { SCHEMA };
export default InstagramAccount;
