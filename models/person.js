'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Person extends Model {
    static associate(models) {
      // define association here
      this.hasMany(models.InstitutionMembership);
      this.hasMany(models.Speaker, {onDelete: 'cascade'});
      this.hasMany(models.Adjudicator, {onDelete: 'cascade'});
      this.hasMany(models.LanguageStatus, {onDelete: 'cascade'});
      this.hasMany(models.Preregistration, {foreignKey: 'speakerTwoId', onDelete: 'cascade', as: 'speakerTwo'});
      this.hasMany(models.Preregistration, {foreignKey: 'registrantId', onDelete: 'cascade', as: 'registrant'});
      this.belongsTo(models.Account);
    }
  }
  Person.init({
    name: DataTypes.STRING,
    placeholder: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Person',
  });
  return Person;
};