'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Institution extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Institution.init({
    name: DataTypes.STRING,
    shortName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Institution',
  });
  return Institution;
};