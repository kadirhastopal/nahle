// models/Category.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    slug: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
        validate: {
            isLowercase: true,
            is: /^[a-z0-9-]+$/
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['status']
        },
        {
            fields: ['slug'],
            unique: true
        }
    ]
});

// Model metodları
Category.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    values.is_active = values.status === 'active';
    return values;
};

// Static metodlar
Category.findBySlug = function(slug) {
    return this.findOne({
        where: { slug, status: 'active' }
    });
};

Category.findActive = function(options = {}) {
    return this.findAll({
        where: { status: 'active' },
        order: [['name', 'ASC']],
        ...options
    });
};

module.exports = Category;
