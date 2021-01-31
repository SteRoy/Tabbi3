'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class DebateTeamAllocation extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.belongsTo(models.Debate);
            this.hasOne(models.Team);
        }
    }

    DebateTeamAllocation.init({
        position: {
            type: DataTypes.ENUM,
            values: ["OG", "OO", "CG", "CO"]
        }
    }, {
        sequelize,
        modelName: 'DebateTeamAllocation',
    });
    return DebateTeamAllocation;
};