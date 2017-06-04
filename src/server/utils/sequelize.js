// @flow

const hoistModels = function (models: Object): Object {
  const Sequelize = require('sequelize');
  const env = process.env.NODE_ENV || 'development';
  const config = require('../../../config/sequelize.json')[env];

  let sequelize;

  if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable]);
  } else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
  }

  for (const [name, model] of Object.entries(models)) {
    models[name] = model(sequelize);
  }

  models.sequelize = sequelize;
  models.Sequelize = Sequelize;
  return models;
};
export { hoistModels };
