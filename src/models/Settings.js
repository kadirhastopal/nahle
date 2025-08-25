const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Settings = sequelize.define('Settings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    key: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    value: {
        type: DataTypes.TEXT
    },
    type: {
        type: DataTypes.ENUM('text', 'number', 'boolean', 'json', 'file'),
        defaultValue: 'text'
    },
    group: {
        type: DataTypes.STRING,
        defaultValue: 'general'
    },
    description: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true,
    tableName: 'settings'
});

module.exports = Settings;
