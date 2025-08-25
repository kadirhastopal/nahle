const sequelize = require('../config/database');
const Admin = require('./Admin');
const Tour = require('./Tour');
const Blog = require('./Blog');
const Testimonial = require('./Testimonial');
const Contact = require('./Contact');
const Settings = require('./Settings');

// Sync database
sequelize.sync({ alter: true })
    .then(() => console.log('Database synced'))
    .catch(err => console.error('Database sync error:', err));

module.exports = {
    sequelize,
    Admin,
    Tour,
    Blog,
    Testimonial,
    Contact,
    Settings
};
