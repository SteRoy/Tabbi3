'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PersonalClash extends Model {
    static associate(models) {
      // define association here
    }
  }
  PersonalClash.init({
    fromAccountId: DataTypes.INTEGER,
    targetAccountId: DataTypes.INTEGER,
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