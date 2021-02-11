'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LanguageStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Person);
    }
  };

  LanguageStatus.init({
    type: {
      type: DataTypes.ENUM,
      values: ["ESL", "EFL", "Novice"]
    }
  }, {
    sequelize,
    modelName: 'LanguageStatus',
  });
  return LanguageStatus;
};