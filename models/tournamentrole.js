'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TournamentRole extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Tournament);
      this.belongsTo(models.Account);
    }
  }
  TournamentRole.init({
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'TournamentRole',
  });
  return TournamentRole;
};