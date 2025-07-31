const sequelize = require('../config/database');
const AdminUser = require('./AdminUser');
const Category = require('./Category');
const Tour = require('./Tour');
const ContactMessage = require('./ContactMessage');

// Model ilişkilerini tanımla
Category.hasMany(Tour, { foreignKey: 'category_id' });
Tour.belongsTo(Category, { foreignKey: 'category_id' });

// Tüm modelleri export et
module.exports = {
  sequelize,
  AdminUser,
  Category,
  Tour,
  ContactMessage
};
