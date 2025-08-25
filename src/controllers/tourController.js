const { Tour } = require('../models');
const { processImage } = require('../middlewares/upload');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
    try {
        const { type, is_active, is_featured } = req.query;
        const where = {};
        
        if (type) where.type = type;
        if (is_active !== undefined) where.is_active = is_active === 'true';
        if (is_featured !== undefined) where.is_featured = is_featured === 'true';
        
        const tours = await Tour.findAll({ 
            where,
            order: [['departure_date', 'ASC']]
        });
        
        res.json({
            success: true,
            data: tours
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Turlar alınamadı'
        });
    }
};

exports.getById = async (req, res) => {
    try {
        const tour = await Tour.findByPk(req.params.id);
        
        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tur bulunamadı'
            });
        }
        
        res.json({
            success: true,
            data: tour
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Tur alınamadı'
        });
    }
};

exports.create = async (req, res) => {
    try {
        const tourData = req.body;
        
        // Generate slug
        tourData.slug = tourData.title
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        
        // Process images if uploaded
        if (req.files && req.files.length > 0) {
            tourData.images = [];
            for (const file of req.files) {
                const image = await processImage(file.buffer, 'tours');
                tourData.images.push(image);
            }
        }
        
        const tour = await Tour.create(tourData);
        
        res.status(201).json({
            success: true,
            data: tour
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Tur oluşturulamadı',
            error: error.message
        });
    }
};

exports.update = async (req, res) => {
    try {
        const tour = await Tour.findByPk(req.params.id);
        
        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tur bulunamadı'
            });
        }
        
        const updateData = req.body;
        
        // Update slug if title changed
        if (updateData.title && updateData.title !== tour.title) {
            updateData.slug = updateData.title
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
        }
        
        // Process new images if uploaded
        if (req.files && req.files.length > 0) {
            const newImages = [];
            for (const file of req.files) {
                const image = await processImage(file.buffer, 'tours');
                newImages.push(image);
            }
            updateData.images = [...(tour.images || []), ...newImages];
        }
        
        await tour.update(updateData);
        
        res.json({
            success: true,
            data: tour
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Tur güncellenemedi'
        });
    }
};

exports.delete = async (req, res) => {
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
            message: 'Tur silindi'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Tur silinemedi'
        });
    }
};
