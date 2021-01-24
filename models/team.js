'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Team extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.hasOne(models.Speaker, {
                foreignKey: 'Speaker1Id'
            });

            this.hasOne(models.Speaker, {
                foreignKey: 'Speaker2Id'
            });

            this.belongsTo(models.Tournament);
        }
    }

    Team.init({
        name: DataTypes.STRING,
        codename: DataTypes.STRING,
        swing: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Team',
    });
    return Team;
};