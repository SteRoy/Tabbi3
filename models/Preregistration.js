'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Preregistration extends Model {
        static associate(models) {
            this.belongsTo(models.Person, {as: 'speakerTwo'});
            this.belongsTo(models.Person, {as: 'registrant'});
            this.belongsTo(models.Tournament);
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