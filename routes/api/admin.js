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

// ==================== TOURS MANAGEMENT ====================

// GET /api/admin/tours - Tüm turları listele
router.get('/tours', authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 50, status, category_id } = req.query;
        const offset = (page - 1) * limit;
        
        const whereClause = {};
        if (status) whereClause.status = status;
        if (category_id) whereClause.category_id = category_id;
        
        const { count, rows } = await Tour.findAndCountAll({
            where: whereClause,
            include: [{
                model: Category,
                as: 'Category',
                attributes: ['id', 'name', 'slug']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });
        
        res.json({
            success: true,
            data: {
                tours: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
        
    } catch (error) {
        console.error('Admin tours listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Turlar listelenirken hata oluştu'
        });
    }
});

// POST /api/admin/tours - Yeni tur ekle
router.post('/tours', [
    authMiddleware,
    body('title')
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Başlık 3-200 karakter arasında olmalıdır'),
    body('category_id')
        .isInt({ min: 1 })
        .withMessage('Geçerli bir kategori seçiniz'),
    body('duration_days')
        .isInt({ min: 1, max: 365 })
        .withMessage('Süre 1-365 gün arasında olmalıdır'),
    body('price_try')
        .isFloat({ min: 0 })
        .withMessage('Geçerli bir fiyat giriniz'),
    body('quota')
        .isInt({ min: 1 })
        .withMessage('Kota en az 1 olmalıdır'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { 
            title, 
            category_id, 
            short_description, 
            description, 
            duration_days, 
            price_try, 
            quota 
        } = req.body;
        
        // Slug oluştur
        const slug = title
            .toLowerCase()
            .replace(/ş/g, 's')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ö/g, 'o')
            .replace(/ı/g, 'i')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
        
        // Slug benzersizliğini kontrol et
        let finalSlug = slug;
        let counter = 1;
        while (await Tour.findOne({ where: { slug: finalSlug } })) {
            finalSlug = `${slug}-${counter}`;
            counter++;
        }
        
        const newTour = await Tour.create({
            title,
            slug: finalSlug,
            category_id,
            short_description,
            description,
            duration_days,
            price_try,
            quota,
            available_quota: quota, // Başlangıçta tüm kota müsait
            status: 'active'
        });
        
        // İlişkili verileri de getir
        const createdTour = await Tour.findByPk(newTour.id, {
            include: [{
                model: Category,
                as: 'Category',
                attributes: ['id', 'name', 'slug']
            }]
        });
        
        res.status(201).json({
            success: true,
            message: 'Tur başarıyla eklendi',
            data: { tour: createdTour }
        });
        
    } catch (error) {
        console.error('Tour creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Tur eklenirken hata oluştu'
        });
    }
});

// PUT /api/admin/tours/:id - Tur güncelle
router.put('/tours/:id', [
    authMiddleware,
    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Başlık 3-200 karakter arasında olmalıdır'),
    body('category_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Geçerli bir kategori seçiniz'),
    body('duration_days')
        .optional()
        .isInt({ min: 1, max: 365 })
        .withMessage('Süre 1-365 gün arasında olmalıdır'),
    body('price_try')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Geçerli bir fiyat giriniz'),
    body('quota')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Kota en az 1 olmalıdır'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const tour = await Tour.findByPk(id);
        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tur bulunamadı'
            });
        }
        
        // Başlık değişirse slug'ı da güncelle
        if (updateData.title && updateData.title !== tour.title) {
            const newSlug = updateData.title
                .toLowerCase()
                .replace(/ş/g, 's')
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ö/g, 'o')
                .replace(/ı/g, 'i')
                .replace(/ç/g, 'c')
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim('-');
            
            // Slug benzersizliğini kontrol et
            let finalSlug = newSlug;
            let counter = 1;
            while (await Tour.findOne({ 
                where: { 
                    slug: finalSlug,
                    id: { [require('sequelize').Op.ne]: id }
                } 
            })) {
                finalSlug = `${newSlug}-${counter}`;
                counter++;
            }
            
            updateData.slug = finalSlug;
        }
        
        await tour.update(updateData);
        
        // Güncellenmiş turu ilişkili verilerle getir
        const updatedTour = await Tour.findByPk(id, {
            include: [{
                model: Category,
                as: 'Category',
                attributes: ['id', 'name', 'slug']
            }]
        });
        
        res.json({
            success: true,
            message: 'Tur başarıyla güncellendi',
            data: { tour: updatedTour }
        });
        
    } catch (error) {
        console.error('Tour update error:', error);
        res.status(500).json({
            success: false,
            message: 'Tur güncellenirken hata oluştu'
        });
    }
});

// PUT /api/admin/tours/:id/status - Tur durumu değiştir
router.put('/tours/:id/status', [
    authMiddleware,
    body('status')
        .isIn(['active', 'inactive', 'full', 'completed'])
        .withMessage('Geçerli bir durum seçiniz'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const tour = await Tour.findByPk(id);
        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tur bulunamadı'
            });
        }
        
        await tour.update({ status });
        
        res.json({
            success: true,
            message: `Tur durumu ${status === 'active' ? 'aktif' : 'pasif'} yapıldı`,
            data: { tour }
        });
        
    } catch (error) {
        console.error('Tour status update error:', error);
        res.status(500).json({
            success: false,
            message: 'Tur durumu güncellenirken hata oluştu'
        });
    }
});

// DELETE /api/admin/tours/:id - Tur sil
router.delete('/tours/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        
        const tour = await Tour.findByPk(id);
        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tur bulunamadı'
            });
        }
        
        await tour.destroy();
        
        res.json({
            success: true,
            message: 'Tur başarıyla silindi'
        });
        
    } catch (error) {
        console.error('Tour delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Tur silinirken hata oluştu'
        });
    }
});
