'use strict';

const table = 'instagram_accounts';
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
        instagram_id: {
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
          type: Sequelize.DATE,
          field: 'deleted_at'
        }
      }
    );
  },
  down(queryInterface) {
    return queryInterface.dropTable(table);
  }
};
