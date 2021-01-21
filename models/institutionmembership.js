'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InstitutionMembership extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Person);
      this.belongsTo(models.Institution);
    }
  }

  InstitutionMembership.init({
    startDate: {
      type: DataTypes.DATE,
      get() {
        const rawDate = this.getDataValue('startDate');
        return rawDate ? new Date(rawDate).toDateString() : "";
      }
    },
    endDate: {
      type: DataTypes.DATE,
      get() {
        const rawDate = this.getDataValue('endDate');
        return rawDate ? new Date(rawDate).toDateString() : "";
      }
    },
  }, {
    indexes: [
      {
        unique: true,
        fields: ['PersonId', 'InstitutionId']
      }
    ],
    sequelize,
    modelName: 'InstitutionMembership',
  });
  return InstitutionMembership;
};