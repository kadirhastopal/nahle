// routes/api/tours.js - Genişletilmiş Tur API'si
const express = require('express');
const router = express.Router();
const { Tour, Category } = require('../../models');
const { Op } = require('sequelize');

// Tüm turları getir (sayfalama ile)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;
        const category = req.query.category;
        const status = req.query.status || 'active';

        const whereClause = { status };
        if (category && category !== 'all') {
            whereClause.category_id = category;
        }

        const { count, rows: tours } = await Tour.findAndCountAll({
            where: whereClause,
            include: [{
                model: Category,
                attributes: ['id', 'name', 'slug']
            }],
            order: [
                ['featured', 'DESC'],
                ['priority', 'DESC'],
                ['start_date', 'ASC']
            ],
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            success: true,
            data: {
                tours,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: count,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('❌ Tours fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Turlar yüklenirken hata oluştu'
        });
    }
});

// Admin: Tüm turları getir (durum filtresiz)
router.get('/admin', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const status = req.query.status;
        
        const whereClause = {};
        if (status && status !== 'all') {
            whereClause.status = status;
        }

        const { count, rows: tours } = await Tour.findAndCountAll({
            where: whereClause,
            include: [{
                model: Category,
                attributes: ['id', 'name', 'slug']
            }],
            order: [
                ['featured', 'DESC'],
                ['priority', 'DESC'],
                ['created_at', 'DESC']
            ],
            limit
        });

        res.json({
            success: true,
            data: {
                tours,
                total: count
            }
        });
    } catch (error) {
        console.error('❌ Admin tours fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Admin turlar yüklenirken hata oluştu'
        });
    }
});

// Tek tur detayı getir
router.get('/:id', async (req, res) => {
    try {
        const tour = await Tour.findOne({
            where: { id: req.params.id },
            include: [{
                model: Category,
                attributes: ['id', 'name', 'slug']
            }]
        });

        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tur bulunamadı'
            });
        }

        res.json({
            success: true,
            data: { tour }
        });
    } catch (error) {
        console.error('❌ Tour detail error:', error);
        res.status(500).json({
            success: false,
            message: 'Tur detayı yüklenirken hata oluştu'
        });
    }
});

// Slug ile tur getir
router.get('/slug/:slug', async (req, res) => {
    try {
        const tour = await Tour.findOne({
            where: { 
                slug: req.params.slug,
                status: 'active'
            },
            include: [{
                model: Category,
                attributes: ['id', 'name', 'slug']
            }]
        });

        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tur bulunamadı'
            });
        }

        res.json({
            success: true,
            data: { tour }
        });
    } catch (error) {
        console.error('❌ Tour by slug error:', error);
        res.status(500).json({
            success: false,
            message: 'Tur detayı yüklenirken hata oluştu'
        });
    }
});

// Yeni tur oluştur (Admin)
router.post('/', async (req, res) => {
    try {
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

        // Slug oluştur
        let tourSlug = slug;
        if (!tourSlug && title) {
            tourSlug = title
                .toLowerCase()
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
            title,
            slug: tourSlug,
            category_id: category_id || null,
            description,
            short_description,
            duration_days: parseInt(duration_days) || null,
            duration_nights: parseInt(duration_nights) || null,
            mekke_nights: parseInt(mekke_nights) || null,
            medine_nights: parseInt(medine_nights) || null,
            price_try: parseFloat(price_try) || null,
            quota: parseInt(quota) || null,
            start_date,
            end_date,
            departure_info: departure_info || null,
            return_info: return_info || null,
            responsible_contacts: responsible_contacts || null,
            mekke_hotel: mekke_hotel || null,
            medine_hotel: medine_hotel || null,
            extra_features,
            required_documents,
            important_notes,
            cancellation_policy,
            payment_terms,
            visit_places,
            included_services,
            excluded_services,
            featured: featured === true || featured === 'true' || featured === '1',
            priority: parseInt(priority) || 0,
            status,
            seo_keywords,
            meta_description
        });

        // Kategori bilgisiyle birlikte döndür
        const tourWithCategory = await Tour.findOne({
            where: { id: tour.id },
            include: [{
                model: Category,
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
                message: 'Geçersiz veri: ' + validationErrors.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Tur oluşturulurken hata oluştu'
        });
    }
});

// Tur güncelle (Admin)
router.put('/:id', async (req, res) => {
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
        if (slug && slug !== tour.slug) {
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
            title: title !== undefined ? title : tour.title,
            slug: tourSlug,
            category_id: category_id !== undefined ? (category_id || null) : tour.category_id,
            description: description !== undefined ? description : tour.description,
            short_description: short_description !== undefined ? short_description : tour.short_description,
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
            extra_features: extra_features !== undefined ? extra_features : tour.extra_features,
            required_documents: required_documents !== undefined ? required_documents : tour.required_documents,
            important_notes: important_notes !== undefined ? important_notes : tour.important_notes,
            cancellation_policy: cancellation_policy !== undefined ? cancellation_policy : tour.cancellation_policy,
            payment_terms: payment_terms !== undefined ? payment_terms : tour.payment_terms,
            visit_places: visit_places !== undefined ? visit_places : tour.visit_places,
            included_services: included_services !== undefined ? included_services : tour.included_services,
            excluded_services: excluded_services !== undefined ? excluded_services : tour.excluded_services,
            featured: featured !== undefined ? (featured === true || featured === 'true' || featured === '1') : tour.featured,
            priority: priority !== undefined ? (parseInt(priority) || 0) : tour.priority,
            status: status !== undefined ? status : tour.status,
            seo_keywords: seo_keywords !== undefined ? seo_keywords : tour.seo_keywords,
            meta_description: meta_description !== undefined ? meta_description : tour.meta_description
        });

        // Güncellenmiş tur bilgilerini kategori ile birlikte getir
        const updatedTour = await Tour.findOne({
            where: { id: tour.id },
            include: [{
                model: Category,
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
                message: 'Geçersiz veri: ' + validationErrors.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Tur güncellenirken hata oluştu'
        });
    }
});

// Tur sil (Admin)
router.delete('/:id', async (req, res) => {
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
            message: 'Tur silinirken hata oluştu'
        });
    }
});

// Öne çıkan turları getir
router.get('/featured/list', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        
        const tours = await Tour.findAll({
            where: { 
                featured: true,
                status: 'active'
            },
            include: [{
                model: Category,
                attributes: ['id', 'name', 'slug']
            }],
            order: [
                ['priority', 'DESC'],
                ['start_date', 'ASC']
            ],
            limit
        });

        res.json({
            success: true,
            data: { tours }
        });
    } catch (error) {
        console.error('❌ Featured tours error:', error);
        res.status(500).json({
            success: false,
            message: 'Öne çıkan turlar yüklenirken hata oluştu'
        });
    }
});

// Kategori bazında turları getir
router.get('/category/:categorySlug', async (req, res) => {
    try {
        const category = await Category.findOne({
            where: { slug: req.params.categorySlug }
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const offset = (page - 1) * limit;

        const { count, rows: tours } = await Tour.findAndCountAll({
            where: { 
                category_id: category.id,
                status: 'active'
            },
            include: [{
                model: Category,
                attributes: ['id', 'name', 'slug']
            }],
            order: [
                ['featured', 'DESC'],
                ['priority', 'DESC'],
                ['start_date', 'ASC']
            ],
            limit,
            offset
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            success: true,
            data: {
                category,
                tours,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: count,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('❌ Category tours error:', error);
        res.status(500).json({
            success: false,
            message: 'Kategori turları yüklenirken hata oluştu'
        });
    }
});

module.exports = router;