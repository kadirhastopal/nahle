// scripts/migrate-tours.js - Tour tablosunu genişletme scripti
const { sequelize } = require('../config/database');

async function migrateTours() {
    try {
        console.log('🚀 Tour tablosu migration başlatılıyor...');
        
        // Migration dosyasını import et
        const migration = require('../migrations/002-extend-tours-table');
        
        // Migration'ı çalıştır
        await migration.up(sequelize.getQueryInterface(), sequelize);
        
        console.log('✅ Tour tablosu başarıyla güncellendi!');
        console.log('📋 Yeni alanlar eklendi:');
        console.log('   - duration_nights: Gece sayısı');
        console.log('   - mekke_nights: Mekke gece sayısı');
        console.log('   - medine_nights: Medine gece sayısı');
        console.log('   - departure_info: Gidiş uçuş bilgileri');
        console.log('   - return_info: Dönüş uçuş bilgileri');
        console.log('   - responsible_contacts: Sorumlular');
        console.log('   - mekke_hotel: Mekke otel bilgileri');
        console.log('   - medine_hotel: Medine otel bilgileri');
        console.log('   - extra_features: Ekstra özellikler');
        console.log('   - required_documents: Gerekli evraklar');
        console.log('   - important_notes: Önemli notlar');
        console.log('   - cancellation_policy: İptal politikası');
        console.log('   - payment_terms: Ödeme şartları');
        console.log('   - visit_places: Ziyaret yerleri');
        console.log('   - hotel_images: Otel resimleri');
        console.log('   - daily_schedule: Günlük program');
        console.log('   - featured: Öne çıkan tur');
        console.log('   - priority: Öncelik sırası');
        console.log('   - seo_keywords: SEO anahtar kelimeler');
        
    } catch (error) {
        console.error('❌ Migration hatası:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Script'i çalıştır
if (require.main === module) {
    migrateTours();
}

module.exports = migrateTours;