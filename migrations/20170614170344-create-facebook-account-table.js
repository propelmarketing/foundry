'use strict';

const table = 'facebook_accounts';
module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable(
      table,
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        facebook_id: {
          type: Sequelize.STRING,
          unique: true
        },
        profile: Sequelize.JSONB,
        user_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        created_at: {
          type: Sequelize.DATE
        },
        updated_at: {
          type: Sequelize.DATE
        },
        deleted_at: {
          type: Sequelize.DATE
        }
      }
    );
  },
  down(queryInterface) {
    return queryInterface.dropTable(table);
  }
};
