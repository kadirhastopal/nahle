// routes/api/admin.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { AdminUser, Tour, Category, ContactMessage } = require('../../models');
const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Doğrulama hatası',
            errors: errors.array()
        });
    }
    next();
};

// Auth middleware
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Erişim reddedildi. Token gerekli.'
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await AdminUser.findByPk(decoded.id);
        
        if (!user || user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz token'
            });
        }
        
        req.user = user;
        next();
        
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Geçersiz token'
        });
    }
};

// POST /api/admin/login - Admin girişi
router.post('/login', [
    body('login')
        .trim()
        .notEmpty()
        .withMessage('Kullanıcı adı veya e-posta gerekli'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Şifre en az 6 karakter olmalıdır'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { login, password } = req.body;
        
        // Kullanıcı doğrulama
        const user = await AdminUser.authenticate(login, password);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Kullanıcı adı/e-posta veya şifre hatalı'
            });
        }
        
        // JWT token oluştur
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '24h' }
        );
        
        res.json({
            success: true,
            message: 'Giriş başarılı',
            data: {
                token,
                user: user.toJSON()
            }
        });
        
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Giriş işlemi sırasında hata oluştu'
        });
    }
});

// GET /api/admin/profile - Admin profili
router.get('/profile', authMiddleware, (req, res) => {
    res.json({
        success: true,
        data: { user: req.user.toJSON() }
    });
});

// GET /api/admin/dashboard - Dashboard istatistikleri
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        // Genel istatistikler
        const totalTours = await Tour.count({ where: { status: 'active' } });
        const totalCategories = await Category.count({ where: { status: 'active' } });
        const newMessages = await ContactMessage.count({ where: { status: 'new' } });
        const totalMessages = await ContactMessage.count();
        
        // Son turlar
        const recentTours = await Tour.findAll({
            limit: 5,
            order: [['created_at', 'DESC']],
            include: [{
                model: Category,
                as: 'Category',
                attributes: ['name']
            }]
        });
        
        // Son mesajlar
        const recentMessages = await ContactMessage.findAll({
            limit: 5,
            order: [['created_at', 'DESC']],
            where: { status: 'new' }
        });
        
        res.json({
            success: true,
            data: {
                stats: {
                    totalTours,
                    totalCategories,
                    newMessages,
                    totalMessages
                },
                recentTours,
                recentMessages
            }
        });
        
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Dashboard verileri alınırken hata oluştu'
        });
    }
});

// GET /api/admin/messages - İletişim mesajları
router.get('/messages', authMiddleware, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        
        const whereClause = status ? { status } : {};
        
        const { count, rows } = await ContactMessage.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });
        
        res.json({
            success: true,
            data: {
                messages: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
        
    } catch (error) {
        console.error('Admin messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Mesajlar alınırken hata oluştu'
        });
    }
});

// PUT /api/admin/messages/:id/status - Mesaj durumu güncelle
router.put('/messages/:id/status', [
    authMiddleware,
    body('status')
        .isIn(['new', 'read', 'replied', 'archived'])
        .withMessage('Geçerli bir durum seçiniz'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const message = await ContactMessage.findByPk(id);
        
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Mesaj bulunamadı'
            });
        }
        
        message.status = status;
        await message.save();
        
        res.json({
            success: true,
            message: 'Mesaj durumu güncellendi',
            data: { message }
        });
        
    } catch (error) {
        console.error('Message status update error:', error);
        res.status(500).json({
            success: false,
            message: 'Mesaj durumu güncellenirken hata oluştu'
        });
    }
});

module.exports = router;
