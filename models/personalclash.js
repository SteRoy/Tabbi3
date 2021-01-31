'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PersonalClash extends Model {
    static associate(models) {
      this.belongsTo(models.Account, {
        foreignKey: {
          name: 'fromAccountId',
          allowNull: false
        },
        onDelete: 'CASCADE'
      });

      this.belongsTo(models.Account, {
        foreignKey: {
          name: 'targetAccountId',
          allowNull: false
        },
        onDelete: 'CASCADE'
      });
    }
  }
  PersonalClash.init({
    type: {
      type: DataTypes.ENUM,
      values: ['soft', 'hard']
    }
  }, {
    sequelize,
    modelName: 'PersonalClash',
  });
  return PersonalClash;
};