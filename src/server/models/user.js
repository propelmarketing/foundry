// @flow
/* eslint no-param-reassign: [2, { "props": true, "ignorePropertyModificationsFor": ["attributes"] }] */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import Exception from 'server/exception';
import Logger from 'server/utils/logger';
import passwordGenerator from 'generate-password';
import Sequelize from 'sequelize';

import { GENERAL_ERROR } from 'server/exception/codes';

/**
 * User Model Schema definition
 * see http://docs.sequelizejs.com/manual/tutorial/models-definition.html
 */
const SCHEMA: Object = {
  applications: {
    type: Sequelize.ARRAY(Sequelize.STRING),
    allowNull: true,
    defaultValue: []
  },
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  lastPasswordUpdate: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn('NOW'),
    field: 'last_password_update'
  },
  password: Sequelize.STRING,
  portalPassword: {
    type: Sequelize.STRING,
    field: 'portal_password'
  },
  portalValid: Sequelize.VIRTUAL,
  thrivehivePassword: {
    type: Sequelize.STRING,
    field: 'thrivehive_password'
  },
  thrivehiveValid: Sequelize.VIRTUAL,
  username: {
    type: Sequelize.STRING,
    field: 'email',
    unique: true
  }
};

const OPTIONS: Object = {
  timestamps: true,
  paranoid: true,
  underscored: true
};

const DEFAULT_PASSWORD_OPTIONS: Object = {
  length: 16,
  numbers: true,
  symbols: false,
  excludeSimilarCharacters: true,
  strict: true
};

// Number of salt rounds
const SALT_ROUNDS: number = 10;
const LOGGER = Logger.get('db');

/**
 *
 */
const User = function (sequelize: Object): Object {
  const model = sequelize.define('user', SCHEMA, OPTIONS);
  model.associate = function (models: Object): void {
    model.hasMany(models.FacebookAccount);
    model.hasMany(models.GoogleAccount);
    model.hasMany(models.InstagramAccount);
    model.hasMany(models.TwitterAccount);
  };

  /**
   * BEGIN CLASS METHODS
   */

  /**
   * Handler method for the beforeBulkCreate hook
   * @param {Array<Object>} instances The list of new user data
   * @returns {Promise<void>}
   */
  model.beforeBulkCreate = async (instances: Array<Object>): Promise<void> => {
    if (!Array.isArray(instances)) {
      throw new Exception(GENERAL_ERROR('[beforeBulkCreate] Cannot execute hook. Provided data was not an array'));
    }

    for (let i = 0; i < instances.length; i++) {
      const attributes: Object = instances[i];
      // Username will always exist in instances since is it a candidate key
      const username: string = attributes.username;
      LOGGER.info(`[beforeBulkCreate] Calling [processUserAltData] for user ${username}...`);
      model.processUserAltData(username, attributes);
      LOGGER.info(`[beforeBulkCreate] Calling [processUserPasswordHookHelper] for user ${username}...`);
      await model.processUserPasswordHookHelper(username, attributes);
      LOGGER.info(`[beforeBulkCreate] Processing completed for ${username}`);
    }
  };

  /**
   * Handler method for the beforeBulkUpdate hook
   * @param {Object} attributes The object containing all the user attributes to update
   * @returns {Promise<void>}
   */
  model.beforeBulkUpdate = async (options: Object): Promise<void> => {
    const attributes: Object = options.attributes;
    const where: Object = options.where;

    if ((!attributes || typeof attributes !== 'object') && !Array.isArray(attributes)) {
      throw new Exception(
        GENERAL_ERROR('[beforeBulkUpdate] Failed. provided/found attributes was not an object or array')
      );
    }

    const username: string = ('username' in where) ? where.username : attributes.where;
    LOGGER.info(`[beforeBulkUpdate] Calling [processUserAltData] for user ${username}...`);
    model.processUserAltData(username, attributes);
    if (attributes.password) {
      LOGGER.info(`[beforeBulkUpdate] Calling [processUserPasswordHookHelper] for user ${username}...`);
      await model.processUserPasswordHookHelper(username, attributes);
    }
    LOGGER.info(`[beforeBulkUpdate] Processing completed for ${username}`);
  };

  /**
   * Handler method for the beforeSave hook
   * @param {Object} instance The user data being saved
   * @returns {Promise<void>}
   */
  model.beforeCreate = async (instance: Object): Promise<void> => {
    if (!instance || typeof instance !== 'object' || Array.isArray(instance)) {
      throw new Exception(GENERAL_ERROR('[beforeCreate] Cannot execute hook. Provided data was not valid'));
    }
    const username: string = instance.username;
    LOGGER.info(`[beforeCreate] Calling [processUserAltData] for user ${username}...`);
    model.processUserAltData(username, instance);
    LOGGER.info(`[beforeCreate] Calling [processUserPasswordHookHelper] for user ${username}...`);
    await model.processUserPasswordHookHelper(username, instance);
    LOGGER.info(`[beforeCreate] Processing completed for ${username}`);
  };

  /**
   * Handler method for the beforeSave hook
   * @param {Object} instance The user data being saved
   * @returns {Promise<void>}
   */
  model.beforeUpdate = async (instance: Object): Promise<void> => {
    if (!instance || typeof instance !== 'object' || Array.isArray(instance)) {
      throw new Exception(GENERAL_ERROR('[beforeUpdate] Cannot execute hook. Provided data was not valid'));
    }
    const username: string = instance.username;
    LOGGER.info(`[beforeUpdate] Calling [processUserAltData] for user ${username}...`);
    model.processUserAltData(username, instance);
    if (instance.changed('password')) {
      LOGGER.info(`[beforeUpdate] Calling [processUserPasswordHookHelper] for user ${username}...`);
      await model.processUserPasswordHookHelper(username, instance);
    }
    LOGGER.info(`[beforeUpdate] Processing completed for ${username}`);
  };

   /**
    * Using OWSAP best practices, generate a pseduo-random secure password
    * @param {Object} options Additional/override options to provide to the password generator
    * @return {string} The generated password
    */
  model.generatePassword = function (options: Object = {}): string {
    const opts: Object = Object.assign({}, DEFAULT_PASSWORD_OPTIONS, options);
    return passwordGenerator.generate(opts);
  };

  /**
   * Hash the provided password using bcrypt's hash algorithm
   * @param  {string} password The plain text password to hash
   * @return {Promise}
   */
  model.hashPassword = function (password: string): Promise<any> {
    if (typeof password !== 'string') {
      throw new Exception(GENERAL_ERROR('password must be a string'));
    }
    return new Promise((resolve, reject): any => {
      return bcrypt.hash(password, SALT_ROUNDS, (err: any, hash: string): void => {
        if (err) {
          return reject(err);
        }
        return resolve(hash);
      });
    });
  };

  /**
   * [description]
   * @param  {[type]} username   [description]
   * @param  {[type]} attributes [description]
   * @return {[type]}            [description]
   */
  model.processUserAltData = function (username: string, attributes: Object): void {
    if (!username) {
      throw new Exception(
        GENERAL_ERROR('[processUserAltData] Unexpected error - Username not be found. Cannot continue with request')
      );
    }

    const user: Object = attributes;
    if (!attributes || typeof attributes !== 'object') {
      LOGGER.warn('[processUserAltData] Attempted to process a non-object input of attributes. Skipping...');
      return;
    }

    if (user.username) {
      LOGGER.info(`[processUserAltData] Processing username (toLowerCase) for ${username}`);
      user.username = user.username.toLowerCase();
    }

    if (user.applications) {
      LOGGER.info(`[processUserAltData] Processing applications (toLowerCase) for ${username}`);
      user.applications = user.applications.map(function (client: string): string {
        return client.toLowerCase();
      });
    }
  };

  /**
   * [description]
   * @param  {[type]} attributes [description]
   * @return {[type]}            [description]
   */
  model.processUserPasswordHookHelper = async function (username: string, attributes: Object): Promise<string|void> {
    if (!attributes || typeof attributes !== 'object' || Array.isArray(attributes)) {
      throw new Exception(GENERAL_ERROR('[processUserPasswordHookHelper] attributes must be an object'));
    }

    if (!attributes.password) {
      throw new Exception(GENERAL_ERROR('[processUserPasswordHookHelper] password is required'));
    }

    try {
      if (!attributes.password) {
        throw new Exception(GENERAL_ERROR('password is required'));
      }

      LOGGER.info(`[processUserPasswordHookHelper] Processing password for user: ${username}`);
      const hashedPassword = await model.hashPassword(attributes.password);
      LOGGER.info(`[processUserPasswordHookHelper] Done processing password for user: ${username}`);
      attributes.password = hashedPassword;
      attributes.portalPassword = '';
      attributes.thrivehivePassword = '';
      LOGGER.info(`[processUserPasswordHookHelper] Password updated for ${username}`);
      return;
    } catch (e) {
      const message = `An error occured while processing hook 'processUserPasswordHookHelper' on user ${username}`;
      LOGGER.error(`${message}: ${e}`);
      throw new Exception(GENERAL_ERROR(message));
    }
  };

  /**
   * END CLASS METHODS
   */

  /**
   * BEGIN INSTANCE METHODS
   */

  /**
   * [verifyPassword description]
   * @param  {[type]}  password [description]
   * @return {Promise}          [description]
   */
  model.prototype.verifyPassword = async function (password: string): Promise<boolean> {
    // Set the model fields 'portalValid' and 'thrivehiveValid' to false
    // to indicate that this user is a default fail-fast state
    this.portalValid = false;
    this.thrivehiveValid = false;

    // Check new password
    const applications: Array<string> = this.get('applications');
    const hasPortal: boolean = applications.indexOf('portal') !== -1;
    const hasThrivehive: boolean = applications.indexOf('thrivehive') !== -1;

    LOGGER.info(
      `[verifyPassword] ${this.username}: { applications: ${applications.toString()}, \
      has_portal: ${hasPortal.toString()}, has_thrivehive: ${hasThrivehive.toString()}, \
      password? ${(this.password != null).toString()}, portalPassword? ${(this.portalPassword != null).toString()}, \
      thrivehivePassword? ${(this.thrivehivePassword != null).toString()} }`
    );

    // As users login in, we'll transfer their old Portal and/pr ThriveHive passwords
    // to a single password. We'll check that password first (if it exists) before
    // the legacy passwords to prevent extra checking after the first login.
    if (this.password) {
      const validPassword: boolean = await this.verifyUserPassword(password);
      this.portalValid = hasPortal;
      this.thrivehiveValid = hasThrivehive;
      LOGGER.info(
        `[verifyPassword] OK - ${this.username} is valid: \
        { portalValid: ${this.portalValid.toString()}, thrivehiveValid: ${this.thrivehiveValid.toString()} }`
      );
      return validPassword;
    }

    if (this.portalPassword && hasPortal) {
      this.portalValid = await this.verifyPortalPassword(password);
    }

    if (this.thrivehivePassword && hasThrivehive) {
      this.thrivehiveValid = await this.verifyThrivehivePassword(password);
    }

    if (this.portalValid || this.thrivehiveValid) {
      await this.updatePassword(password);
    }

    LOGGER.info(
      `[verifyPassword] OK - ${this.username} is valid: \
      { portalValid: ${this.portalValid}, thrivehiveValid: ${this.thrivehiveValid} }`
    );

    return (this.portalValid || this.thrivehiveValid);
  };

  /**
   * Update the user password with the user-provided one. Update this as plain text and let the update hooks handle
   * the encryption
   * @param  {string} password        The new user-provided password
   * @return {Promise}                The Promise returned by Sequelize.save
   */
  model.prototype.updatePassword = function (password: string): void {
    LOGGER.info(
      `[updatePassword] ${this.username}`
    );

    return this.update({ password });
  };

  /**
   * Verify the user-provided password with the stored password. If the passwords match, then the Promise is resolved;
   * otherwise the Promise is rejected
   * @param  {string} password The user-provided password
   * @return {Promise}
   */
  model.prototype.verifyUserPassword = function (password: string): Promise<boolean> {
    LOGGER.info(`[verifyUserPassword] Checking password for user ${this.username}...`);
    return new Promise((resolve, reject): void => {
      bcrypt.compare(password, this.password, function (err, res) {
        if (err) {
          reject(err);
        }
        resolve(res);
      });
    });
  };

  /**
   * Decrypt the Portal password and compare to the user-provided one. The Promise is resolved if the passwords match;
   * otherwise the Promise is rejected
   * @param {string} password The user-provided password
   * @return {Promise}
   */
  model.prototype.verifyPortalPassword = function (password: string): Promise<boolean> {
    LOGGER.info(`[verifyPortalPassword] ${this.username}`);
    const combined = this.portalPassword.split('$');
    const iterations: number = parseInt(combined[1], 10);
    const salt: string = combined[2];
    const hash: string = combined[3];

    return new Promise((resolve, reject): void => {
      crypto.pbkdf2(password, salt, iterations, 32, 'sha256', (err, verify) => {
        if (err) {
          reject(err);
        }
        resolve(verify.toString('base64') === hash);
      });
    });
  };

  /**
   * Decrypt the ThriveHive password and compare to the user-provided one. The Promise is resolved if the passwords
   * match; otherwise the Promise is rejected
   * @param {string} password The user-provided password
   * @return {Promise}
   */
  model.prototype.verifyThrivehivePassword = function (password: string): Promise<boolean> {
    LOGGER.info(`[verifyThrivehivePassword] ${this.username}`);
    const combined = this.thrivehivePassword.split(':');
    const iterations: number = parseInt(combined[0], 10);
    const salt: string = Buffer.from(Buffer.from(combined[1], 'base64'), 'hex');
    const hash: string = Buffer.from(combined[2], 'base64').toString('hex');

    return new Promise((resolve, reject): void => {
      crypto.pbkdf2(password, salt, iterations, 24, 'sha1', (err, verify) => {
        if (err) {
          reject(err);
        }
        resolve(verify.toString('hex') === hash);
      });
    });
  };

  /**
   * Capture the builkCreate event and perfrom the same operations in the 'beforeCreate' hook
   * @param {Object} user The new User data object
   */
  model.hook('beforeBulkCreate', model.beforeBulkCreate);

  /**
   * If the password attribute is in the object representing the proposed changes to the User model,
   * then intercept that password, hash it, then add it back to the proposed changes.
   * @param {Object} attributes The proposed attributes to change in the User model
   */
  model.hook('beforeBulkUpdate', model.beforeBulkUpdate);

  /**
   * The beforeCreate hook proxies both the beforeCreateo hook
   * into the User model before creating or updating to hash the User password, if applicable.
   * Use the 'changed' method to determine if the password has changed or not.
   * @param {Object} user The User instance containing all the data, including the updated data
   */
  model.hook('beforeCreate', model.beforeCreate);

  /**
   *
   */
  model.hook('beforeUpdate', model.beforeUpdate);

  return model;
};

export { SCHEMA };
export default User;
