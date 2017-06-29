// @flow
/* eslint no-param-reassign: [2, { "props": true, "ignorePropertyModificationsFor": ["passwordResetToken"] }] */

import crypto from 'crypto';
import Logger from 'server/utils/logger';
import Sequelize from 'sequelize';

const LOGGER = Logger.get('db');

/**
 * Password Reset Token Model Schema definition
 * see http://docs.sequelizejs.com/manual/tutorial/models-definition.html
 */
const SCHEMA: Object = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: Sequelize.STRING,
  token: {
    type: Sequelize.STRING,
    unique: true
  },
  expires_at: Sequelize.DATE
};

const OPTIONS: Object = {
  timestamps: true,
  updatedAt: false,
  underscored: true
};

/**
 *
 */
const PasswordResetToken = function (sequelize: Object): Object {
  const model = sequelize.define('password_reset_tokens', SCHEMA, OPTIONS);

  model.hook('beforeCreate', (passwordResetToken: Object): void => {
    const createdAt = new Date(passwordResetToken.created_at);
    const expiresAt = new Date(createdAt.setDate(createdAt.getDate() + 1));
    passwordResetToken.expires_at = expiresAt;
  });

  model.getPasswordResetToken = async function (email: string): Promise<Object> {
    let passwordResetToken;

    do {
      try {
        const buffer = await crypto.randomBytes(48);
        const tokenString = buffer.toString('base64');

        passwordResetToken = await model.findOne({ where: { token: tokenString } });

        if (!passwordResetToken) {
          passwordResetToken = await model.create({ email, token: tokenString });
        }
      } catch (e) {
        LOGGER.error(e);
          // If the error is a unique key constraint, then keep trying to generate a token.
          // Otherwise, break out of the loop and propagate error.
        if (e.message.indexOf('duplicate key value violates unique constraint') === -1) {
          throw e;
        }
      }
    } while (!passwordResetToken);

    return passwordResetToken;
  };

  model.prototype.verifyToken = function (token: string): boolean {
    return this.expires_at > new Date() && this.token === token;
  };

  return model;
};

export { SCHEMA };
export default PasswordResetToken;
