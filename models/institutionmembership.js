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
    isActive: {
      type: DataTypes.VIRTUAL,
      get() {
        const rawStartDate = this.getDataValue('startDate');
        const rawEndDate = this.getDataValue('endDate');
        if (!rawStartDate && !rawEndDate) {
          return true;
        } else if (rawStartDate && !rawEndDate) {
          return true;
        } else if (!rawStartDate && rawEndDate) {
          const endDate = new Date.parse(rawEndDate);
          if (new Date() < endDate) {
            return true;
          }
        } else {
          const startDate = Date.parse(rawStartDate);
          const endDate = Date.parse(rawEndDate);
          const now = new Date();
          if (startDate < now && endDate > now) {
            return true;
          }
        }
      }
    }
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