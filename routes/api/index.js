// routes/api/index.js
const express = require('express');
const router = express.Router();

// Rate limiting
const rateLimit = require('express-rate-limit');

// ✅ DÜZELTME: Rate limit ayarları daha güvenli
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100, // IP başına maksimum istek
    message: {
        success: false,
        message: 'Çok fazla istek gönderildi, lütfen 15 dakika sonra tekrar deneyin.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // ✅ DÜZELTME: Trust proxy ayarını doğru şekilde yapılandır
    skip: (req) => {
        // Development'ta rate limiting'i atla
        return process.env.NODE_ENV !== 'production';
    }
});

// Contact form için özel rate limit
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 saat
    max: 5, // Saatte maksimum 5 mesaj
    message: {
        success: false,
        message: 'Saatte maksimum 5 mesaj gönderebilirsiniz.'
    },
    skip: (req) => {
        // Development'ta rate limiting'i atla
        return process.env.NODE_ENV !== 'production';
    }
});

// Rate limiting uygula
router.use(limiter);

// API Routes
router.use('/tours', require('./tours'));
router.use('/categories', require('./categories'));
router.use('/contact', contactLimiter, require('./contact'));
router.use('/admin', require('./admin'));

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
