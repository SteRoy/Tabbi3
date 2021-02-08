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
            this.belongsTo(models.Tournament);
            this.hasMany(models.RoundSetting);
            this.hasMany(models.Debate, {onDelete: 'CASCADE'});
        }
    }

    Round.init({
        title: DataTypes.STRING,
        sequence: DataTypes.INTEGER,
        type: {
            type: DataTypes.ENUM,
            values: ['inround', 'outround']
        },
        motion: DataTypes.TEXT,
        infoslide: DataTypes.TEXT,
        completed: DataTypes.BOOLEAN,
        drawReleased: DataTypes.BOOLEAN,
        motionReleased: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Round',
    });
    return Round;
};