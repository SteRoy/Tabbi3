'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Venue extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.belongsTo(models.Tournament);
            this.hasMany(models.Debate);
        }
    }

    Venue.init({
        name: DataTypes.STRING,
        active: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Venue',
    });
    return Venue;
};