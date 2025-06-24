// config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Sequelize instance oluştur
const sequelize = new Sequelize(
    process.env.DB_NAME || 'nahletur_nahletur_db',
    process.env.DB_USER || 'nahletur_nahletur_user',
    process.env.DB_PASS || 'JW#xjMHZn*pR',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        dialectOptions: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci'
        },
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        timezone: '+03:00', // Türkiye saati
        define: {
            timestamps: true,
            underscored: false,
            freezeTableName: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci'
        }
    }
);

// Database bağlantısını test et
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL database connection successful!');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, testConnection };
