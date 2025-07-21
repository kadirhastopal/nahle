// routes/api/admin.js - TAM ADMIN API DOSYASI
const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { AdminUser, Tour, Category, ContactMessage } = require('../../models');
const { Op } = require('sequelize');
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

// ==================== AUTH ENDPOINTS ====================

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

// routes/api/admin.js - Dashboard endpoint'ini bu ile değiştir

// GET /api/admin/dashboard - Dashboard istatistikleri (SIMPLE VERSION)
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        console.log('📊 Dashboard API çağrıldı - User:', req.user.username);
        
        // Basit test verileri döndür
        const responseData = {
            stats: {
                totalTours: 0,
                totalCategories: 0,
                newMessages: 0,
                totalMessages: 0
            },
            recentTours: [],
            recentMessages: []
        };
        
        // Güvenli şekilde count'ları al
        try {
            responseData.stats.totalTours = await Tour.count();
            console.log('✅ Tours count:', responseData.stats.totalTours);
        } catch (e) {
            console.error('❌ Tours count error:', e.message);
        }
        
        try {
            responseData.stats.totalCategories = await Category.count();
            console.log('✅ Categories count:', responseData.stats.totalCategories);
        } catch (e) {
            console.error('❌ Categories count error:', e.message);
        }
        
        try {
            responseData.stats.totalMessages = await ContactMessage.count();
            console.log('✅ Messages count:', responseData.stats.totalMessages);
        } catch (e) {
            console.error('❌ Messages count error:', e.message);
        }
        
        console.log('✅ Dashboard response:', responseData);
        
        res.json({
            success: true,
            data: responseData
        });
        
    } catch (error) {
        console.error('❌ Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Dashboard hatası: ' + error.message
        });
    }
});

// ==================== TOURS MANAGEMENT ====================

// routes/api/admin.js - Tours GET endpoint'ini bu ile değiştir

// GET /api/admin/tours - Tüm turları listele (DÜZELTME)
router.get('/tours', authMiddleware, async (req, res) => {
    try {
        console.log('🚌 Admin tours API çağrıldı - User:', req.user.username);
        
        const { page = 1, limit = 50, status, category_id } = req.query;
        const offset = (page - 1) * limit;
        
        // Basit query ile başla
        const whereClause = {};
        if (status && status !== 'all') {
            whereClause.status = status;
        }
        if (category_id) {
            whereClause.category_id = category_id;
        }
        
        console.log('🔍 Where clause:', whereClause);
        
        // Turları al (association olmadan)
        const { count, rows } = await Tour.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [
                ['featured', 'DESC'],
                ['priority', 'DESC'],
                ['created_at', 'DESC']
            ],
            attributes: [
                'id', 'title', 'slug', 'description', 'short_description',
                'duration_days', 'price_try', 'quota', 'status', 'featured',
                'start_date', 'end_date', 'created_at', 'category_id'
            ]
        });
        
        console.log('✅ Tours found:', count);
        
        // Kategorileri ayrı olarak al
        let categories = [];
        try {
            categories = await Category.findAll({
                attributes: ['id', 'name', 'slug']
            });
            console.log('✅ Categories found:', categories.length);
        } catch (catError) {
            console.error('❌ Categories error:', catError.message);
        }
        
        // Response'u oluştur
        const responseData = {
            tours: rows.map(tour => {
                const tourData = tour.toJSON();
                
                // Kategori bilgisini ekle
                const category = categories.find(cat => cat.id === tour.category_id);
                if (category) {
                    tourData.Category = category.toJSON();
                }
                
                return tourData;
            }),
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(count / limit)
            }
        };
        
        console.log('📊 Response prepared with', responseData.tours.length, 'tours');
        
        res.json({
            success: true,
            data: responseData
        });
        
    } catch (error) {
        console.error('❌ Admin tours listing error:', error);
        console.error('❌ Error stack:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Turlar listelenirken hata oluştu: ' + error.message
        });
    }
});

// POST /api/admin/tours - Yeni tur ekle
router.post('/tours', authMiddleware, async (req, res) => {
    try {
        console.log('🚌 Yeni tur oluşturuluyor:', req.body);
        
        const {
            title,
            category_id,
            description,
            short_description,
            duration_days,
            duration_nights,
            mekke_nights,
            medine_nights,
            price_try,
            quota,
            start_date,
            end_date,
            departure_info,
            return_info,
            responsible_contacts,
            mekke_hotel,
            medine_hotel,
            extra_features,
            required_documents,
            important_notes,
            cancellation_policy,
            payment_terms,
            visit_places,
            included_services,
            excluded_services,
            featured = false,
            priority = 0,
            status = 'active',
            slug,
            seo_keywords,
            meta_description
        } = req.body;

        // Temel validasyon
        if (!title || !title.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Doğrulama hatası: Başlık zorunludur'
            });
        }

        if (!duration_days || duration_days < 1) {
            return res.status(400).json({
                success: false,
                message: 'Doğrulama hatası: Geçerli bir gün sayısı giriniz'
            });
        }

        if (!price_try || price_try < 0) {
            return res.status(400).json({
                success: false,
                message: 'Doğrulama hatası: Geçerli bir fiyat giriniz'
            });
        }

        // Slug oluştur
        let tourSlug = slug;
        if (!tourSlug && title) {
            tourSlug = title
                .toLowerCase()
                .replace(/ş/g, 's')
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ö/g, 'o')
                .replace(/ı/g, 'i')
                .replace(/ç/g, 'c')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim('-');
        }

        // Slug benzersizlik kontrolü
        if (tourSlug) {
            const existingTour = await Tour.findOne({ where: { slug: tourSlug } });
            if (existingTour) {
                tourSlug = `${tourSlug}-${Date.now()}`;
            }
        }

        // Yeni tur oluştur
        const tour = await Tour.create({
            title: title.trim(),
            slug: tourSlug,
            category_id: category_id || null,
            description: description?.trim() || null,
            short_description: short_description?.trim() || null,
            duration_days: parseInt(duration_days) || null,
            duration_nights: parseInt(duration_nights) || null,
            mekke_nights: parseInt(mekke_nights) || null,
            medine_nights: parseInt(medine_nights) || null,
            price_try: parseFloat(price_try) || null,
            quota: parseInt(quota) || null,
            start_date: start_date || null,
            end_date: end_date || null,
            departure_info: departure_info || null,
            return_info: return_info || null,
            responsible_contacts: responsible_contacts || null,
            mekke_hotel: mekke_hotel || null,
            medine_hotel: medine_hotel || null,
            extra_features: extra_features?.trim() || null,
            required_documents: required_documents?.trim() || null,
            important_notes: important_notes?.trim() || null,
            cancellation_policy: cancellation_policy?.trim() || null,
            payment_terms: payment_terms?.trim() || null,
            visit_places: visit_places?.trim() || null,
            included_services: included_services?.trim() || null,
            excluded_services: excluded_services?.trim() || null,
            featured: featured === true || featured === 'true' || featured === '1',
            priority: parseInt(priority) || 0,
            status: status || 'active',
            seo_keywords: seo_keywords?.trim() || null,
            meta_description: meta_description?.trim() || null
        });

        console.log('✅ Tur başarıyla oluşturuldu:', tour.id);

        // Kategori bilgisiyle birlikte döndür
        const tourWithCategory = await Tour.findOne({
            where: { id: tour.id },
            include: [{
                model: Category,
                as: 'Category',
                attributes: ['id', 'name', 'slug']
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Tur başarıyla oluşturuldu',
            data: { tour: tourWithCategory }
        });

    } catch (error) {
        console.error('❌ Tour create error:', error);
        
        // Sequelize validation hatalarını yakala
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Doğrulama hatası: ' + validationErrors.join(', ')
            });
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Bu başlık veya slug zaten kullanılıyor'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Tur oluşturulurken hata oluştu: ' + error.message
        });
    }
});

// PUT /api/admin/tours/:id - Tur güncelle  
router.put('/tours/:id', authMiddleware, async (req, res) => {
    try {
        const tour = await Tour.findByPk(req.params.id);
        
        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tur bulunamadı'
            });
        }

        const {
            title,
            category_id,
            description,
            short_description,
            duration_days,
            duration_nights,
            mekke_nights,
            medine_nights,
            price_try,
            quota,
            start_date,
            end_date,
            departure_info,
            return_info,
            responsible_contacts,
            mekke_hotel,
            medine_hotel,
            extra_features,
            required_documents,
            important_notes,
            cancellation_policy,
            payment_terms,
            visit_places,
            included_services,
            excluded_services,
            featured,
            priority,
            status,
            slug,
            seo_keywords,
            meta_description
        } = req.body;

        // Slug güncelleme kontrolü
        let tourSlug = slug || tour.slug;
        if (title && title !== tour.title && !slug) {
            tourSlug = title
                .toLowerCase()
                .replace(/ş/g, 's')
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ö/g, 'o')
                .replace(/ı/g, 'i')
                .replace(/ç/g, 'c')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim('-');
        }
        
        if (tourSlug && tourSlug !== tour.slug) {
            const existingTour = await Tour.findOne({ 
                where: { 
                    slug: tourSlug,
                    id: { [Op.ne]: tour.id }
                }
            });
            if (existingTour) {
                tourSlug = `${tourSlug}-${Date.now()}`;
            }
        }

        // Tur bilgilerini güncelle
        await tour.update({
            title: title !== undefined ? title?.trim() : tour.title,
            slug: tourSlug,
            category_id: category_id !== undefined ? (category_id || null) : tour.category_id,
            description: description !== undefined ? (description?.trim() || null) : tour.description,
            short_description: short_description !== undefined ? (short_description?.trim() || null) : tour.short_description,
            duration_days: duration_days !== undefined ? (parseInt(duration_days) || null) : tour.duration_days,
            duration_nights: duration_nights !== undefined ? (parseInt(duration_nights) || null) : tour.duration_nights,
            mekke_nights: mekke_nights !== undefined ? (parseInt(mekke_nights) || null) : tour.mekke_nights,
            medine_nights: medine_nights !== undefined ? (parseInt(medine_nights) || null) : tour.medine_nights,
            price_try: price_try !== undefined ? (parseFloat(price_try) || null) : tour.price_try,
            quota: quota !== undefined ? (parseInt(quota) || null) : tour.quota,
            start_date: start_date !== undefined ? start_date : tour.start_date,
            end_date: end_date !== undefined ? end_date : tour.end_date,
            departure_info: departure_info !== undefined ? departure_info : tour.departure_info,
            return_info: return_info !== undefined ? return_info : tour.return_info,
            responsible_contacts: responsible_contacts !== undefined ? responsible_contacts : tour.responsible_contacts,
            mekke_hotel: mekke_hotel !== undefined ? mekke_hotel : tour.mekke_hotel,
            medine_hotel: medine_hotel !== undefined ? medine_hotel : tour.medine_hotel,
            extra_features: extra_features !== undefined ? (extra_features?.trim() || null) : tour.extra_features,
            required_documents: required_documents !== undefined ? (required_documents?.trim() || null) : tour.required_documents,
            important_notes: important_notes !== undefined ? (important_notes?.trim() || null) : tour.important_notes,
            cancellation_policy: cancellation_policy !== undefined ? (cancellation_policy?.trim() || null) : tour.cancellation_policy,
            payment_terms: payment_terms !== undefined ? (payment_terms?.trim() || null) : tour.payment_terms,
            visit_places: visit_places !== undefined ? (visit_places?.trim() || null) : tour.visit_places,
            included_services: included_services !== undefined ? (included_services?.trim() || null) : tour.included_services,
            excluded_services: excluded_services !== undefined ? (excluded_services?.trim() || null) : tour.excluded_services,
            featured: featured !== undefined ? (featured === true || featured === 'true' || featured === '1') : tour.featured,
            priority: priority !== undefined ? (parseInt(priority) || 0) : tour.priority,
            status: status !== undefined ? status : tour.status,
            seo_keywords: seo_keywords !== undefined ? (seo_keywords?.trim() || null) : tour.seo_keywords,
            meta_description: meta_description !== undefined ? (meta_description?.trim() || null) : tour.meta_description
        });

        // Güncellenmiş tur bilgilerini kategori ile birlikte getir
        const updatedTour = await Tour.findOne({
            where: { id: tour.id },
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
        console.error('❌ Tour update error:', error);
        
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Doğrulama hatası: ' + validationErrors.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Tur güncellenirken hata oluştu: ' + error.message
        });
    }
});

// DELETE /api/admin/tours/:id - Tur sil
router.delete('/tours/:id', authMiddleware, async (req, res) => {
    try {
        const tour = await Tour.findByPk(req.params.id);
        
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
        console.error('❌ Tour delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Tur silinirken hata oluştu: ' + error.message
        });
    }
});

// ==================== CATEGORIES MANAGEMENT ====================

// GET /api/admin/categories - Tüm kategorileri listele
router.get('/categories', authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 50, status } = req.query;
        const offset = (page - 1) * limit;
        
        const whereClause = {};
        if (status) whereClause.status = status;
        
        const { count, rows } = await Category.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });
        
        res.json({
            success: true,
            data: {
                categories: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });
        
    } catch (error) {
        console.error('Admin categories listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Kategoriler listelenirken hata oluştu'
        });
    }
});

// POST /api/admin/categories - Yeni kategori ekle
router.post('/categories', [
    authMiddleware,
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Kategori adı 2-100 karakter arasında olmalıdır'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Açıklama maksimum 500 karakter olabilir'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { name, description, status = 'active' } = req.body;
        
        // Slug oluştur
        const slug = name
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
        
        // Slug benzersizlik kontrolü
        const existingCategory = await Category.findOne({ where: { slug } });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Bu kategori adı zaten kullanılıyor'
            });
        }
        
        const category = await Category.create({
            name: name.trim(),
            slug,
            description: description?.trim() || null,
            status
        });
        
        res.status(201).json({
            success: true,
            message: 'Kategori başarıyla oluşturuldu',
            data: { category }
        });
        
    } catch (error) {
        console.error('Category creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Kategori eklenirken hata oluştu'
        });
    }
});

// PUT /api/admin/categories/:id - Kategori güncelle
router.put('/categories/:id', [
    authMiddleware,
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Kategori adı 2-100 karakter arasında olmalıdır'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Açıklama maksimum 500 karakter olabilir'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
        }
        
        // Adı değişirse slug'ı da güncelle
        if (updateData.name && updateData.name !== category.name) {
            const newSlug = updateData.name
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
            
            // Slug benzersizlik kontrolü
            const existingCategory = await Category.findOne({ 
                where: { 
                    slug: newSlug,
                    id: { [Op.ne]: category.id }
                }
            });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Bu kategori adı zaten kullanılıyor'
                });
            }
            
            updateData.slug = newSlug;
        }
        
        await category.update(updateData);
        
        res.json({
            success: true,
            message: 'Kategori başarıyla güncellendi',
            data: { category }
        });
        
    } catch (error) {
        console.error('Category update error:', error);
        res.status(500).json({
            success: false,
            message: 'Kategori güncellenirken hata oluştu'
        });
    }
});

// DELETE /api/admin/categories/:id - Kategori sil
router.delete('/categories/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
        }
        
        // Bu kategoriye ait turların olup olmadığını kontrol et
        const tourCount = await Tour.count({ where: { category_id: id } });
        if (tourCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Bu kategoriye ait turlar bulunmaktadır. Önce turları silin veya başka kategoriye taşıyın.'
            });
        }
        
        await category.destroy();
        
        res.json({
            success: true,
            message: 'Kategori başarıyla silindi'
        });
        
    } catch (error) {
        console.error('Category delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Kategori silinirken hata oluştu'
        });
    }
});

// ==================== MESSAGES MANAGEMENT ====================

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
        console.error('Messages listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Mesajlar listelenirken hata oluştu'
        });
    }
});

// PUT /api/admin/messages/:id - Mesaj durumu güncelle
router.put('/messages/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['new', 'read', 'replied'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz durum değeri'
            });
        }
        
        const message = await ContactMessage.findByPk(id);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Mesaj bulunamadı'
            });
        }
        
        await message.update({ status });
        
        res.json({
            success: true,
            message: 'Mesaj durumu güncellendi',
            data: { message }
        });
        
    } catch (error) {
        console.error('Message update error:', error);
        res.status(500).json({
            success: false,
            message: 'Mesaj güncellenirken hata oluştu'
        });
    }
});

// DELETE /api/admin/messages/:id - Mesaj sil
router.delete('/messages/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        
        const message = await ContactMessage.findByPk(id);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Mesaj bulunamadı'
            });
        }
        
        await message.destroy();
        
        res.json({
            success: true,
            message: 'Mesaj başarıyla silindi'
        });
        
    } catch (error) {
        console.error('Message delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Mesaj silinirken hata oluştu'
        });
    }
});

module.exports = router;