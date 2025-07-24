// routes/api/index.js - ACİL DURUM ÇÖZÜMÜ
const express = require('express');
const router = express.Router();

// Rate limiting
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // IP başına maksimum istek
    message: {
        success: false,
        message: 'Çok fazla istek gönderildi, lütfen 15 dakika sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        return process.env.NODE_ENV !== 'production';
    }
});

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 saat
    max: 5, // Saatte maksimum 5 mesaj
    message: {
        success: false,
        message: 'Saatte maksimum 5 mesaj gönderebilirsiniz.'
    },
    skip: (req) => {
        return process.env.NODE_ENV !== 'production';
    }
});

// Rate limiting uygula
router.use(limiter);

// ✅ TEMİZ API Routes (upload olmadan)
router.use('/tours', require('./tours'));
router.use('/categories', require('./categories'));
router.use('/contact', contactLimiter, require('./contact'));
router.use('/admin', require('./admin'));

// ❌ Upload route'unu şimdilik devre dışı bırakıyoruz
// router.use('/upload', require('./upload')); 

// API Ana endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Nahletur.com API v1.0',
        endpoints: {
            tours: '/api/tours',
            categories: '/api/categories',
            contact: '/api/contact',
            admin: '/api/admin'
        },
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;