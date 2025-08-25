const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Blog = sequelize.define('Blog', {
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
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    excerpt: {
        type: DataTypes.TEXT
    },
    image: {
        type: DataTypes.STRING
    },
    category: {
        type: DataTypes.STRING
    },
    tags: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    author: {
        type: DataTypes.STRING,
        defaultValue: 'Admin'
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    published_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
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
    tableName: 'blogs'
});

module.exports = Blog;
