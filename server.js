// server.js - TUR DETAY ROUTE'LARI EKLENMİŞ VERSİYON
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const multer = require('multer');
const fs = require('fs');
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

// ✅ DÜZELTME: Uploads dizinini oluştur
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// ✅ DÜZELTME: Multer yapılandırması - Resim yükleme
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = path.join(__dirname, 'uploads');
        
        // Upload tipine göre klasör belirle
        if (req.route.path.includes('tour-image')) {
            uploadPath = path.join(uploadPath, 'tours');
        } else if (req.route.path.includes('hotel-images')) {
            uploadPath = path.join(uploadPath, 'hotels');
        }
        
        // Klasörü oluştur
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Dosya adını oluştur: timestamp-originalname
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${timestamp}-${name}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Sadece resim dosyalarına izin ver
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
        }
    }
});

// Static dosyalar
app.use(express.static(path.join(__dirname, "public")));
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/admin", express.static(path.join(__dirname, "admin")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use('/api', require('./routes/api'));

// ✅ YENİ: Resim yükleme endpoint'leri
app.post('/api/admin/upload/tour-image/:tourId', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Resim dosyası bulunamadı'
            });
        }

        const tourId = req.params.tourId;
        const imageUrl = `/uploads/tours/${req.file.filename}`;

        // Tur bilgisini güncelle
        const tour = await Tour.findByPk(tourId);
        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tur bulunamadı'
            });
        }

        await tour.update({ image_url: imageUrl });

        res.json({
            success: true,
            message: 'Resim başarıyla yüklendi',
            data: {
                imageUrl,
                filename: req.file.filename
            }
        });
    } catch (error) {
        console.error('❌ Image upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Resim yüklenirken hata oluştu'
        });
    }
});

app.post('/api/admin/upload/hotel-images/:tourId', upload.array('images', 5), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Resim dosyası bulunamadı'
            });
        }

        const tourId = req.params.tourId;
        const hotelType = req.body.hotel_type; // 'mekke' or 'medine'

        const tour = await Tour.findByPk(tourId);
        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tur bulunamadı'
            });
        }

        // Yüklenen resimlerin URL'lerini oluştur
        const imageUrls = req.files.map(file => `/uploads/hotels/${file.filename}`);

        // Tour'un hotel_images JSON'ını güncelle
        let hotelImages = tour.hotel_images || {};
        if (typeof hotelImages === 'string') {
            hotelImages = JSON.parse(hotelImages);
        }

        if (!hotelImages[hotelType]) {
            hotelImages[hotelType] = [];
        }

        hotelImages[hotelType].push(...imageUrls);

        await tour.update({ hotel_images: hotelImages });

        res.json({
            success: true,
            message: `${hotelType} otel resimleri başarıyla yüklendi`,
            data: {
                imageUrls,
                hotelType
            }
        });
    } catch (error) {
        console.error('❌ Hotel images upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Otel resimleri yüklenirken hata oluştu'
        });
    }
});

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

// ✅ YENİ: Tur detay sayfası route'u
app.get('/tur/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'tour-detail.html'));
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
        <priority>0.6</priority>
    </url>
</urlset>`;
    res.send(sitemap);
});

// 404 handler
app.get('*', (req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    
    // Multer hatalarını yakala
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Dosya boyutu çok büyük (max 5MB)'
            });
        }
    }
    
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Sunucu hatası' 
            : error.message
    });
});

// Database connection and server start
async function startServer() {
    try {
        // Database bağlantısını test et
        await testConnection();
        console.log('✅ Database bağlantısı başarılı');
        
        // Modelleri senkronize et
        await sequelize.sync({ alter: false });
        console.log('✅ Database modelleri senkronize edildi');
        
        // Server'ı başlat
        app.listen(PORT, () => {
            console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
            console.log(`📁 Admin panel: http://localhost:${PORT}/admin`);
            console.log(`📂 Uploads: ${path.join(__dirname, 'uploads')}`);
        });
        
    } catch (error) {
        console.error('❌ Server başlatma hatası:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 SIGTERM alındı, server kapatılıyor...');
    await sequelize.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 SIGINT alındı, server kapatılıyor...');
    await sequelize.close();
    process.exit(0);
});

// Server'ı başlat
startServer();