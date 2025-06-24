// setup-database.js
require('dotenv').config();
const { syncDatabase } = require('./models');

const setupDatabase = async () => {
    try {
        console.log('🔄 Database ve demo veriler oluşturuluyor...');
        
        // Force sync - tüm tabloları yeniden oluştur
        await syncDatabase(true);
        
        console.log('✅ Database ve demo veriler hazır!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
};

setupDatabase();
