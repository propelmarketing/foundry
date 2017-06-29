// @flow

import Sequelize from 'sequelize';

/**
 * Client Model Schema definition
 * see http://docs.sequelizejs.com/manual/tutorial/models-definition.html
 */
const SCHEMA = {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: Sequelize.STRING,
    unique: true
  },
  name: {
    type: Sequelize.STRING,
    unique: true
  }
};

const OPTIONS = {
  timestamps: true,
  paranoid: true,
  underscored: true
};

/**
 *
 */
const ApiKey = function (sequelize: Object): Object {
  const model = sequelize.define('api_keys', SCHEMA, OPTIONS);
  return model;
};

export { SCHEMA };
export default ApiKey;
