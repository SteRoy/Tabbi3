'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Preregistration extends Model {
        static associate(models) {
            this.belongsTo(models.Tournament);
            this.belongsTo(models.Person, {as: 'speakerTwo'});
            this.belongsTo(models.Person, {as: 'registrant'});
        }
    }

    Preregistration.init({
        type: {
            type: DataTypes.ENUM,
            values: ["adjudicator", "team"],
            required: true
        },
        teamName: DataTypes.STRING,
        speakerTwoAccepted: DataTypes.BOOLEAN,
        reference: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Preregistration',
    });
    return Preregistration;
};