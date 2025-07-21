// server.js - SEO Sayfaları için güncellenmiş routing
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

// Trust proxy ayarı
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
} else {
    app.set('trust proxy', false);
}

// Helmet middleware
app.use(helmet({
    contentSecurityPolicy: false
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
app.use(express.static(path.join(__dirname, "public")));
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/admin", express.static(path.join(__dirname, "admin")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use('/api', require('./routes/api'));

// ✅ YENİ: SEO Sayfaları için routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/umre-turlari', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'umre-turlari.html'));
});

app.get('/hac-turlari', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'hac-turlari.html'));
});

app.get('/hakkimizda', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'hakkimizda.html'));
});

app.get('/iletisim', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'iletisim.html'));
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

// ✅ YENİ: Sitemap.xml
app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://nahletur.com/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://nahletur.com/umre-turlari</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://nahletur.com/hac-turlari</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    <url>
        <loc>https://nahletur.com/hakkimizda</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
    <url>
        <loc>https://nahletur.com/iletisim</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
</urlset>`;
    res.send(sitemap);
});

// ✅ YENİ: robots.txt
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://nahletur.com/sitemap.xml`;
    res.send(robots);
});

// 404 handler - Ana sayfaya yönlendir
app.get('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Sunucu hatası' 
            : error.message
    });
});

// Database setup fonksiyonu
const setupDatabase = async () => {
    try {
        console.log('🔄 Database setup başlatılıyor...');
        
        // Sync database
        await sequelize.sync({ alter: true });
        
        console.log('✅ Database synchronized!');
        
        // Check if admin user exists
        const adminCount = await AdminUser.count();
        if (adminCount === 0) {
            // Create default data
            await AdminUser.create({
                username: 'admin',
                email: 'admin@nahletur.com',
                password_hash: 'admin123',
                full_name: 'Sistem Yöneticisi',
                role: 'super_admin'
            });
            
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
            
            console.log('✅ Demo data created successfully!');
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
        
        // Views klasörünü oluştur
        const viewsDir = path.join(__dirname, 'views');
        if (!require('fs').existsSync(viewsDir)) {
            require('fs').mkdirSync(viewsDir, { recursive: true });
        }
        
        // Server'ı başlat
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log('\n🚀 NAHLETUR.COM SERVER BAŞLATILDI');
            console.log('=====================================');
            console.log(`📱 Ana Sayfa: http://localhost:${PORT}`);
            console.log(`🕌 Umre Turları: http://localhost:${PORT}/umre-turlari`);
            console.log(`🕌 Hac Turları: http://localhost:${PORT}/hac-turlari`);
            console.log(`ℹ️  Hakkımızda: http://localhost:${PORT}/hakkimizda`);
            console.log(`📞 İletişim: http://localhost:${PORT}/iletisim`);
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