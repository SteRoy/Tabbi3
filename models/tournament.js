'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tournament extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.TournamentRole);
      this.hasMany(models.TournamentSetting);
      this.hasMany(models.Speaker);
      this.hasMany(models.Team);
      this.hasMany(models.Adjudicator);
      this.hasMany(models.Round);
      this.hasMany(models.Venue);
    }
  }
  Tournament.init({
    name: DataTypes.STRING,
    slug: {
      type: DataTypes.STRING,
      unique: true
    },
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Tournament',
  });
  return Tournament;
};