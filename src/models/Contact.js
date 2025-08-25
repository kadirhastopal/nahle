const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define('Contact', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_replied: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    replied_at: {
        type: DataTypes.DATE
    },
    reply_message: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true,
    tableName: 'contacts'
});

module.exports = Contact;
