'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasOne(models.Person);
    }
  }
  Account.init({
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    salt: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Account',
  });
  return Account;
};