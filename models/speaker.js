'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Speaker extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.belongsTo(models.Tournament);
            this.belongsTo(models.Person);
            this.hasOne(models.Team,{as: 'Speaker1'});
            this.hasOne(models.Team,{as: 'Speaker2'});
        }
    }

    Speaker.init({
        redacted: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Speaker',
    });
    return Speaker;
};