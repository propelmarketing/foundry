// @flow

const hoistModels = function (data: Object): Object {
  const models: Object = {};
  const Sequelize: Function = require('sequelize');
  const env: string = process.env.NODE_ENV || 'development';
  const config: Object = require('../../../config/sequelize.json')[env];

  let sequelize: Object;

  if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable]);
  } else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
  }

  let name: string;
  let model: Function;

  for (name in data) {
    if (Object.prototype.hasOwnProperty.call(data, name)) {
      models[name] = data[name](sequelize);
    }
  }

  for (name in models) {
    if (Object.prototype.hasOwnProperty.call(models, name)) {
      model = models[name];
      if ('associate' in model) {
        model.associate(models);
      }
    }
  }

  models.sequelize = sequelize;
  models.Sequelize = Sequelize;
  return models;
};
export default hoistModels;
