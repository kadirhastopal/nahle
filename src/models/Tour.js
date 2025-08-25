const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tour = sequelize.define('Tour', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('hac', 'umre'),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'TRY'
    },
    duration: {
        type: DataTypes.STRING,
        allowNull: false
    },
    departure_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    return_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    quota: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    available_quota: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    features: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    includes: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    excludes: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    images: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    meta_title: {
        type: DataTypes.STRING
    },
    meta_description: {
        type: DataTypes.TEXT
    },
    meta_keywords: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true,
    tableName: 'tours'
});

module.exports = Tour;
