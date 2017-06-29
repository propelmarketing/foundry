'use strict';

const table = 'clients';
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
        name: {
          type: Sequelize.STRING,
          unique: true
        },
        client_id: {
          type: Sequelize.STRING,
          unique: true
        },
        client_secret: {
          type: Sequelize.STRING,
          unique: true
        },
        client_url: {
          type: Sequelize.STRING
        },
        image_url: Sequelize.STRING,
        link_text: Sequelize.STRING,
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
