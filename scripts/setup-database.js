require('dotenv').config();
const { sequelize, Admin, Settings } = require('../src/models');

async function setupDatabase() {
    try {
        console.log('🔄 Veritabanı oluşturuluyor...');
        
        // Sync database
        await sequelize.sync({ force: true });
        console.log('✅ Veritabanı tabloları oluşturuldu');
        
        // Create default admin
        await Admin.create({
            username: process.env.ADMIN_USERNAME || 'admin',
            email: 'admin@nahletur.com',
            password: process.env.ADMIN_PASSWORD || 'Admin123!@#',
            full_name: 'Sistem Yöneticisi',
            role: 'superadmin'
        });
        console.log('✅ Admin kullanıcı oluşturuldu');
        
        // Default settings
        const defaultSettings = [
            { key: 'site_name', value: 'Nahletur', type: 'text' },
            { key: 'site_description', value: 'Hac ve Umre Tur Hizmetleri', type: 'text' },
            { key: 'contact_phone', value: '+90 555 000 00 00', type: 'text' },
            { key: 'contact_whatsapp', value: '+90 555 000 00 00', type: 'text' },
            { key: 'contact_email', value: 'info@nahletur.com', type: 'text' },
            { key: 'contact_address', value: 'İstanbul, Türkiye', type: 'text' },
            { key: 'facebook_url', value: 'https://facebook.com', type: 'text' },
            { key: 'instagram_url', value: 'https://instagram.com', type: 'text' },
            { key: 'twitter_url', value: 'https://twitter.com', type: 'text' },
            { key: 'youtube_url', value: 'https://youtube.com', type: 'text' },
            { key: 'google_analytics', value: '', type: 'text' },
            { key: 'meta_keywords', value: 'hac, umre, hac turları, umre turları', type: 'text' },
            { key: 'currency', value: 'TRY', type: 'text' },
            { key: 'currency_symbol', value: '₺', type: 'text' }
        ];
        
        for (const setting of defaultSettings) {
            await Settings.create(setting);
        }
        console.log('✅ Site ayarları oluşturuldu');
        
        console.log('\n📌 Admin Giriş Bilgileri:');
        console.log('   Kullanıcı: ' + (process.env.ADMIN_USERNAME || 'admin'));
        console.log('   Şifre: ' + (process.env.ADMIN_PASSWORD || 'Admin123!@#'));
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Hata:', error);
        process.exit(1);
    }
}

setupDatabase();
