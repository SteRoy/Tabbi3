'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Ballot extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.belongsTo(models.Debate, {allowNull: false});
            this.belongsTo(models.Adjudicator);
            this.hasMany(models.TeamResult, {onDelete: 'CASCADE'});
        }
    }

    Ballot.init({
        enteredByTab: DataTypes.BOOLEAN,
        finalised: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Ballot',
    });
    return Ballot;
};