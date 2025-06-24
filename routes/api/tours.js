// routes/api/tours.js
const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Tour, Category } = require('../../models');
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

// GET /api/tours - Tüm turları listele
router.get('/', [
    query('category').optional().isInt({ min: 1 }),
    query('status').optional().isIn(['active', 'inactive', 'full', 'completed']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('page').optional().isInt({ min: 1 }),
    handleValidationErrors
], async (req, res) => {
    try {
        const { category, status = 'active', limit = 10, page = 1 } = req.query;
        const offset = (page - 1) * limit;
        
        const whereClause = { status };
        if (category) {
            whereClause.category_id = category;
        }
        
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
        console.error('Tours listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Turlar listelenirken hata oluştu'
        });
    }
});

// GET /api/tours/:slug - Tek tur detayı
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        const tour = await Tour.findOne({
            where: { slug, status: 'active' },
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
            data: { tour }
        });
        
    } catch (error) {
        console.error('Tour detail error:', error);
        res.status(500).json({
            success: false,
            message: 'Tur detayı alınırken hata oluştu'
        });
    }
});

// GET /api/tours/category/:categorySlug - Kategoriye göre turlar
router.get('/category/:categorySlug', [
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('page').optional().isInt({ min: 1 }),
    handleValidationErrors
], async (req, res) => {
    try {
        const { categorySlug } = req.params;
        const { limit = 10, page = 1 } = req.query;
        const offset = (page - 1) * limit;
        
        // Önce kategoriyi bul
        const category = await Category.findOne({
            where: { slug: categorySlug, status: 'active' }
        });
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
        }
        
        const { count, rows } = await Tour.findAndCountAll({
            where: { 
                category_id: category.id,
                status: 'active'
            },
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
                category,
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
        console.error('Category tours error:', error);
        res.status(500).json({
            success: false,
            message: 'Kategori turları alınırken hata oluştu'
        });
    }
});

// GET /api/tours/featured - Öne çıkan turlar
router.get('/featured/list', [
    query('limit').optional().isInt({ min: 1, max: 20 }),
    handleValidationErrors
], async (req, res) => {
    try {
        const { limit = 6 } = req.query;
        
        const tours = await Tour.findAll({
            where: { 
                status: 'active',
                available_quota: { [require('sequelize').Op.gt]: 0 }
            },
            include: [{
                model: Category,
                as: 'Category',
                attributes: ['id', 'name', 'slug']
            }],
            limit: parseInt(limit),
            order: [['created_at', 'DESC']]
        });
        
        res.json({
            success: true,
            data: { tours }
        });
        
    } catch (error) {
        console.error('Featured tours error:', error);
        res.status(500).json({
            success: false,
            message: 'Öne çıkan turlar alınırken hata oluştu'
        });
    }
});

module.exports = router;
