'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class TeamResult extends Model {
        static associate(models) {
            this.belongsTo(models.Ballot);
            this.belongsTo(models.Team);
        }
    }

    TeamResult.init({
        teamPoints: DataTypes.INTEGER,
        speakerOneSpeaks: DataTypes.INTEGER,
        speakerTwoSpeaks: DataTypes.INTEGER,
        abnormality: {
            type: DataTypes.ENUM,
            values: [
                "replacedBySwing",
                "speakerOneSpokeTwice",
                "speakerTwoSpokeTwice"
            ]
        }
    }, {
        sequelize,
        modelName: 'TeamResult',
    });
    return TeamResult;
};