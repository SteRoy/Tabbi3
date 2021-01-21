'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InstitutionAlias extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Institution);
    }
  }
  InstitutionAlias.init({
    alias: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'InstitutionAlias',
  });
  return InstitutionAlias;
};