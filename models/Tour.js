const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tour = sequelize.define('tours', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  featured_image: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  gallery: {
    type: DataTypes.JSON,
    allowNull: true
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  max_participants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  current_participants: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Yeni detay alanları
  itinerary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  accommodation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  hotels: {
    type: DataTypes.JSON,
    allowNull: true
  },
  included_services: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  excluded_services: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  important_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'draft'),
    defaultValue: 'draft'
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  meta_title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  meta_description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Tour;
