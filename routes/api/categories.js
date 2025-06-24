// routes/api/categories.js
const express = require('express');
const { Category, Tour } = require('../../models');
const router = express.Router();

// GET /api/categories - Tüm kategorileri listele
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: { status: 'active' },
            attributes: ['id', 'name', 'slug', 'description'],
            order: [['name', 'ASC']]
        });
        
        res.json({
            success: true,
            data: { categories }
        });
        
    } catch (error) {
        console.error('Categories listing error:', error);
        res.status(500).json({
            success: false,
            message: 'Kategoriler listelenirken hata oluştu'
        });
    }
});

// GET /api/categories/with-counts - Tur sayıları ile kategoriler
router.get('/with-counts', async (req, res) => {
    try {
        const categories = await Category.findAll({
            where: { status: 'active' },
            attributes: [
                'id', 'name', 'slug', 'description',
                [require('sequelize').fn('COUNT', require('sequelize').col('Tours.id')), 'tour_count']
            ],
            include: [{
                model: Tour,
                as: 'Tours',
                attributes: [],
                where: { status: 'active' },
                required: false
            }],
            group: ['Category.id'],
            order: [['name', 'ASC']]
        });
        
        res.json({
            success: true,
            data: { categories }
        });
        
    } catch (error) {
        console.error('Categories with counts error:', error);
        res.status(500).json({
            success: false,
            message: 'Kategoriler alınırken hata oluştu'
        });
    }
});

// GET /api/categories/:slug - Tek kategori detayı
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        
        const category = await Category.findOne({
            where: { slug, status: 'active' },
            attributes: ['id', 'name', 'slug', 'description']
        });
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Kategori bulunamadı'
            });
        }
        
        res.json({
            success: true,
            data: { category }
        });
        
    } catch (error) {
        console.error('Category detail error:', error);
        res.status(500).json({
            success: false,
            message: 'Kategori detayı alınırken hata oluştu'
        });
    }
});

module.exports = router;
