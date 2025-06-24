// models/index.js
const { sequelize } = require('../config/database');

// Modelleri import et
const Category = require('./Category');
const Tour = require('./Tour');
const AdminUser = require('./AdminUser');
const ContactMessage = require('./ContactMessage');

// Model ilişkilerini kur
const setupAssociations = () => {
    // Category - Tours ilişkisi (One-to-Many)
    Category.hasMany(Tour, {
        foreignKey: 'category_id',
        as: 'Tours',
        onDelete: 'SET NULL'
    });
    
    Tour.belongsTo(Category, {
        foreignKey: 'category_id',
        as: 'Category'
    });
};

// İlişkileri kur
setupAssociations();

// Database sync fonksiyonu
const syncDatabase = async (force = false) => {
    try {
        console.log('🔄 Database synchronization starting...');
        
        await sequelize.sync({ force });
        
        console.log('✅ Database synchronized successfully!');
        
        // Eğer force=true ise demo veriler ekle
        if (force) {
            await seedDatabase();
        }
        
    } catch (error) {
        console.error('❌ Database sync failed:', error);
        throw error;
    }
};

// Demo veri ekleme fonksiyonu
const seedDatabase = async () => {
    try {
        console.log('🌱 Seeding database with demo data...');
        
        // Kategoriler oluştur
        const hacCategory = await Category.create({
            name: 'Hac Turları',
            slug: 'hac-turlari',
            description: 'Mübarek Hac ibadeti için organize edilen turlar'
        });
        
        const umreCategory = await Category.create({
            name: 'Umre Turları',
            slug: 'umre-turlari',
            description: 'Yıl boyunca düzenlenen Umre ziyaret programları'
        });
        
        // Demo turlar oluştur
        await Tour.bulkCreate([
            {
                category_id: hacCategory.id,
                title: 'Ekonomik Hac Paketi 2025',
                slug: 'ekonomik-hac-paketi-2025',
                description: 'Uygun fiyatlarla Hac ibadeti imkanı.',
                short_description: '15 günlük program, 3-4 kişilik odalar',
                duration_days: 15,
                price_try: 45000,
                quota: 40,
                available_quota: 25
            },
            {
                category_id: umreCategory.id,
                title: 'Lüks Umre Paketi',
                slug: 'luks-umre-paketi',
                description: '10 günlük lüks Umre deneyimi.',
                short_description: '10 gün 9 gece, 5 yıldızlı otel',
                duration_days: 10,
                price_try: 15000,
                quota: 25,
                available_quota: 20
            }
        ]);
        
        // Admin kullanıcı oluştur
        await AdminUser.create({
            username: 'admin',
            email: 'admin@nahletur.com',
            password_hash: 'admin123', // Hook ile hash'lenecek
            full_name: 'Sistem Yöneticisi',
            role: 'super_admin'
        });
        
        console.log('✅ Demo data seeded successfully!');
        
    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        throw error;
    }
};

// Modelleri export et
module.exports = {
    sequelize,
    Category,
    Tour,
    AdminUser,
    ContactMessage,
    syncDatabase,
    seedDatabase
};
