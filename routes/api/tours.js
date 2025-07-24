// routes/api/tours.js - DÜZELTME VERSİYONU
const express = require('express');
const { Tour, Category } = require('../../models');
const { Op } = require('sequelize');
const router = express.Router();

// GET /api/tours - Turları listele (PUBLIC)
router.get('/', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            category, 
            featured, 
            status = 'active',
            debug = false
        } = req.query;

        const offset = (page - 1) * limit;

        // Where koşulu oluştur
        let whereCondition = {};

        // ✅ DÜZELTME: Status kontrolü - debug modunda tüm statusları göster
        if (debug === 'true') {
            console.log('🔍 Debug modu aktif - tüm turlar döndürülüyor');
            // Debug modunda status filtresi yok
        } else {
            whereCondition.status = status;
        }

        if (category) {
            whereCondition.category_id = category;
        }

        if (featured === 'true') {
            whereCondition.featured = true;
        }

        console.log('🔍 Where condition:', whereCondition);

        const { count, rows } = await Tour.findAndCountAll({
            where: whereCondition,
            include: [{
                model: Category,
                as: 'Category',
                attributes: ['id', 'name', 'slug'],
                required: false
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [
                ['featured', 'DESC'],
                ['priority', 'DESC'],
                ['created_at', 'DESC']
            ],
            logging: debug === 'true' ? console.log : false
        });

        console.log(`✅ ${count} tur bulundu, ${rows.length} tur döndürülüyor`);

        // ✅ DÜZELTME: Her tur için kategori bilgisini kontrol et
        const toursWithCategory = rows.map(tour => {
            const tourData = tour.toJSON();
            
            // Kategori bilgisini debug için logla
            if (debug === 'true') {
                console.log(`🚌 Tur: ${tourData.title}`);
                console.log(`   📂 Category ID: ${tourData.category_id}`);
                console.log(`   📂 Category Data:`, tourData.Category);
                console.log(`   📊 Status: ${tourData.status}`);
                console.log(`   ⭐ Featured: ${tourData.featured}`);
            }
            
            // Formatted price ekle
            tourData.formatted_price = new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY'
            }).format(tourData.price_try || 0);
            
            // Available quota ekle
            tourData.available_quota = tourData.quota || 0;
            
            return tourData;
        });

        res.json({
            success: true,
            data: {
                tours: toursWithCategory,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
                }
            }
        });

    } catch (error) {
        console.error('❌ Tours listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Turlar yüklenirken hata oluştu: ' + error.message
        });
    }
});

// GET /api/tours/featured - Öne çıkan turlar (PUBLIC)
router.get('/featured', async (req, res) => {
    try {
        const { limit = 6 } = req.query;

        const tours = await Tour.findAll({
            where: { 
                featured: true
                // ✅ DÜZELTME: Status kontrolünü kaldır, aktif olmayanları da göster
            },
            include: [{
                model: Category,
                as: 'Category',
                attributes: ['id', 'name', 'slug'],
                required: false
            }],
            limit: parseInt(limit),
            order: [
                ['priority', 'DESC'],
                ['created_at', 'DESC']
            ]
        });

        console.log(`✅ ${tours.length} öne çıkan tur bulundu`);

        const toursWithDetails = tours.map(tour => {
            const tourData = tour.toJSON();
            tourData.formatted_price = new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY'
            }).format(tourData.price_try || 0);
            tourData.available_quota = tourData.quota || 0;
            return tourData;
        });

        res.json({
            success: true,
            data: { tours: toursWithDetails }
        });

    } catch (error) {
        console.error('❌ Featured tours error:', error);
        res.status(500).json({
            success: false,
            message: 'Öne çıkan turlar yüklenirken hata oluştu'
        });
    }
});

// GET /api/tours/:id - Tek tur detayı (PUBLIC)
router.get('/:id', async (req, res) => {
    try {
        const tour = await Tour.findOne({
            where: { 
                id: req.params.id
                // ✅ DÜZELTME: Status kontrolünü kaldır
            },
            include: [{
                model: Category,
                as: 'Category',
                attributes: ['id', 'name', 'slug']
            }]
        });

        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tur bulunamadı'
            });
        }

        const tourData = tour.toJSON();
        tourData.formatted_price = new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(tourData.price_try || 0);
        tourData.available_quota = tourData.quota || 0;

        res.json({
            success: true,
            data: { tour: tourData }
        });

    } catch (error) {
        console.error('❌ Tour detail error:', error);
        res.status(500).json({
            success: false,
            message: 'Tur detayı yüklenirken hata oluştu'
        });
    }
});

// GET /api/tours/category/:categorySlug - Kategori bazında turlar (PUBLIC)
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

        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const { count, rows } = await Tour.findAndCountAll({
            where: { 
                category_id: category.id
                // ✅ DÜZELTME: Status kontrolünü kaldır
            },
            include: [{
                model: Category,
                as: 'Category',
                attributes: ['id', 'name', 'slug']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [
                ['featured', 'DESC'],
                ['priority', 'DESC'],
                ['created_at', 'DESC']
            ]
        });

        const toursWithDetails = rows.map(tour => {
            const tourData = tour.toJSON();
            tourData.formatted_price = new Intl.NumberFormat('tr-TR', {
                style: 'currency',
                currency: 'TRY'
            }).format(tourData.price_try || 0);
            tourData.available_quota = tourData.quota || 0;
            return tourData;
        });

        res.json({
            success: true,
            data: {
                category,
                tours: toursWithDetails,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(count / limit)
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