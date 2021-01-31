'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Adjudicator extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.belongsTo(models.Tournament);
            this.belongsTo(models.Person);
        }
    }

    Adjudicator.init({
        redacted: DataTypes.BOOLEAN,
        independent: DataTypes.BOOLEAN,
        testScore: DataTypes.DOUBLE,
        placeholder: DataTypes.BOOLEAN,
        active: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Adjudicator',
    });
    return Adjudicator;
};