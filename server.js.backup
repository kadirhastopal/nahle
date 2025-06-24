// server.js - TAM DÜZELTİLMİŞ VERSİYON
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

// Database ve modeller
const { testConnection } = require('./config/database');
const { sequelize, AdminUser, Category, Tour, ContactMessage } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ DÜZELTME 1: Trust proxy ayarı (Rate limiting için gerekli)
app.set('trust proxy', true);

// ✅ DÜZELTME 2: Helmet middleware düzeltildi
app.use(helmet({
    contentSecurityPolicy: false // ✅ CSP'yi tamamen kapat
}));

app.use(cors());
app.use(compression());

// Morgan sadece development'ta
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('combined'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static dosyalar
// Static dosyalar
app.use(express.static(path.join(__dirname, "public")));
app.use("/admin", express.static(path.join(__dirname, "admin")));

// Routes
app.use('/api', require('./routes/api'));

// Ana sayfa
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Admin paneli
app.get('/admin*', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// API health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 404 handler
app.get('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Bir hata oluştu' 
            : error.message
    });
});

// Database setup ve seed fonksiyonu
const setupDatabase = async () => {
    try {
        console.log('🔄 Database setup başlatılıyor...');
        
        // Database sync
        await sequelize.sync({ alter: true });
        console.log('✅ Database models synchronized');
        
        // Check if admin user exists
        const adminExists = await AdminUser.count();
        
        if (adminExists === 0) {
            console.log('🌱 Creating default admin user...');
            
            // Create default admin user
            await AdminUser.create({
                username: 'admin',
                email: 'admin@nahletur.com',
                password_hash: 'admin123', // Will be hashed by hook
                full_name: 'Sistem Yöneticisi',
                role: 'super_admin',
                status: 'active'
            });
            
            // Create default categories
            const hacCategory = await Category.create({
                name: 'Hac Turları',
                slug: 'hac-turlari',
                description: 'Mübarek Hac ibadeti için organize edilen turlar',
                status: 'active'
            });
            
            const umreCategory = await Category.create({
                name: 'Umre Turları', 
                slug: 'umre-turlari',
                description: 'Yıl boyunca düzenlenen Umre ziyaret programları',
                status: 'active'
            });
            
            // Create sample tours
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
                    available_quota: 25,
                    status: 'active'
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
                    available_quota: 20,
                    status: 'active'
                }
            ]);
            
            console.log('✅ Demo data created successfully!');
            console.log('👤 Admin login: admin / admin123');
        } else {
            console.log('✅ Admin kullanıcısı zaten mevcut');
        }
        
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        throw error;
    }
};

// Server başlatma
const startServer = async () => {
    try {
        // Database bağlantısını test et
        await testConnection();
        
        // Database setup
        await setupDatabase();
        
        // Server'ı başlat
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log('\n🚀 NAHLETUR.COM SERVER BAŞLATILDI');
            console.log('=====================================');
            console.log(`📱 Frontend: http://localhost:${PORT}`);
            console.log(`⚙️  Admin Panel: http://localhost:${PORT}/admin`);
            console.log(`🔌 API: http://localhost:${PORT}/api`);
            console.log('\n👤 ADMIN GİRİŞ BİLGİLERİ:');
            console.log('   Kullanıcı adı: admin');
            console.log('   Şifre: admin123');
            console.log('=====================================\n');
        });
        
        // Server error handling
        server.on('error', (error) => {
            console.error('❌ Server error:', error);
        });
        
    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🔄 SIGTERM received, shutting down gracefully');
    try {
        await sequelize.close();
    } catch (error) {
        console.error('Error closing database:', error);
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🔄 SIGINT received, shutting down gracefully');
    try {
        await sequelize.close();
    } catch (error) {
        console.error('Error closing database:', error);
    }
    process.exit(0);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.error('💥 Unhandled Rejection:', error);
    process.exit(1);
});

startServer();
