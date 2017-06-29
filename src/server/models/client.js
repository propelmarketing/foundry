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
  clientUrl: {
    type: Sequelize.STRING,
    field: 'client_url'
  },
  clientId: {
    type: Sequelize.STRING,
    unique: true,
    field: 'client_id'
  },
  clientSecret: {
    type: Sequelize.STRING,
    unique: true,
    field: 'client_secret'
  },
  imageUrl: {
    type: Sequelize.STRING,
    field: 'image_url'
  },
  name: {
    type: Sequelize.STRING,
    unique: true
  },
  linkText: {
    type: Sequelize.STRING,
    field: 'link_text'
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
const Client = function (sequelize: Object): Object {
  const model = sequelize.define('clients', SCHEMA, OPTIONS);
  return model;
};

export { SCHEMA };
export default Client;
