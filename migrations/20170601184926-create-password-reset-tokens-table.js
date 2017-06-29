'use strict';

const table = 'password_reset_tokens';
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
        email: {
          type: Sequelize.STRING
        },
        token: {
          type: Sequelize.STRING,
          unique: true
        },
        created_at: {
          type: Sequelize.DATE
        },
        expires_at: {
          type: Sequelize.DATE
        }
      }
    );
  },
  down(queryInterface) {
    return queryInterface.dropTable(table);
  }
};
