'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Round extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.hasOne(models.Tournament);
            this.hasMany(models.RoundSetting);
        }
    }

    Round.init({
        title: DataTypes.STRING,
        sequence: DataTypes.INTEGER,
        type: {
            type: DataTypes.ENUM,
            values: ['inround', 'outround']
        },
        completed: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Round',
    });
    return Round;
};