'use strict';

const table = 'users';
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
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: Sequelize.STRING,
        applications: {
          type: Sequelize.ARRAY(Sequelize.STRING),
          allowNull: false,
          defaultValue: []
        },
        portalPassword: {
          type: Sequelize.STRING,
          field: 'portal_password'
        },
        thrivehivePassword: {
          type: Sequelize.STRING,
          field: 'thrivehive_password'
        },
        last_password_update: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.fn('NOW')
        },
        createdAt: {
          type: Sequelize.DATE,
          field: 'created_at'
        },
        updatedAt: {
          type: Sequelize.DATE,
          field: 'updated_at'
        },
        deletedAt: {
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
