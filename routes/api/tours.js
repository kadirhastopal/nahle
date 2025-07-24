// routes/api/tours.js - DÜZELTİLMİŞ VERSİYON
const express = require('express');
const { Tour, Category } = require('../../models');
const { Op } = require('sequelize');
const router = express.Router();

// GET /api/tours - Tüm turları listele (PUBLIC)
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const status = req.query.status || 'active';
        const featured = req.query.featured;
        const categoryId = req.query.category_id;
        const offset = (page - 1) * limit;

        // Where koşulları
        const whereConditions = { status };
        
        if (featured !== undefined) {
            whereConditions.featured = featured === 'true';
        }
        
        if (categoryId) {
            whereConditions.category_id = parseInt(categoryId);
        }

        console.log('🔍 Tours API - Where conditions:', whereConditions);

        const { count, rows: tours } = await Tour.findAndCountAll({
            where: whereConditions,
            include: [{
                model: Category,
                as: 'Category', // ✅ DÜZELTME: Alias kullan
                attributes: ['id', 'name', 'slug']
            }],
            order: [
                ['featured', 'DESC'],
                ['priority', 'DESC'],
                ['created_at', 'DESC']
            ],
            limit,
            offset
        });

        console.log(`✅ ${tours.length} tur bulundu`);

        const totalPages = Math.ceil(count / limit);

        res.json({
            success: true,
            data: {
                tours: tours.map(tour => ({
                    ...tour.toJSON(),
                    available_quota: tour.quota || 0, // Frontend için
                    formatted_price: new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: 'TRY'
                    }).format(tour.price_try || 0)
                })),
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
        console.error('❌ Tours API error:', error);
        res.status(500).json({
            success: false,
            message: 'Turlar yüklenirken hata oluştu: ' + error.message
        });
    }
});

// GET /api/tours/featured - Öne çıkan turlar (PUBLIC)
router.get('/featured', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        
        const tours = await Tour.findAll({
            where: { 
                featured: true,
                status: 'active'
            },
            include: [{
                model: Category,
                as: 'Category',
                attributes: ['id', 'name', 'slug']
            }],
            order: [
                ['priority', 'DESC'],
                ['start_date', 'ASC']
            ],
            limit
        });

        console.log(`✅ ${tours.length} öne çıkan tur bulundu`);

        res.json({
            success: true,
            data: { 
                tours: tours.map(tour => ({
                    ...tour.toJSON(),
                    available_quota: tour.quota || 0,
                    formatted_price: new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: 'TRY'
                    }).format(tour.price_try || 0)
                }))
            }
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
                id: req.params.id,
                status: 'active'
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

        res.json({
            success: true,
            data: { 
                tour: {
                    ...tour.toJSON(),
                    available_quota: tour.quota || 0,
                    formatted_price: new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: 'TRY'
                    }).format(tour.price_try || 0)
                }
            }
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
                as: 'Category',
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
                tours: tours.map(tour => ({
                    ...tour.toJSON(),
                    available_quota: tour.quota || 0,
                    formatted_price: new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: 'TRY'
                    }).format(tour.price_try || 0)
                })),
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