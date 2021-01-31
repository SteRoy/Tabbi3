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
            this.belongsTo(models.Speaker, {
                as: 'Speaker1'
            });

            this.belongsTo(models.Speaker, {
                as: 'Speaker2'
            });

            this.belongsTo(models.Tournament);
            this.hasMany(models.TeamAlloc);
        }
    }

    Team.init({
        name: DataTypes.STRING,
        codename: DataTypes.STRING,
        swing: DataTypes.BOOLEAN,
        active: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Team',
    });
    return Team;
};