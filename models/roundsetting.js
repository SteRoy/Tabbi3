'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RoundSetting extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Round);
    }
  };
  RoundSetting.init({
    key: DataTypes.STRING,
    value: {
      type: DataTypes.STRING,
      get() {
        const rawValue = this.getDataValue('value');
        if (rawValue === 'true') {
          return true;
        } else if (rawValue === 'false') {
          return false;
        } else {
          return rawValue;
        }
      }
    }
  }, {
    sequelize,
    modelName: 'RoundSetting',
  });
  return RoundSetting;
};