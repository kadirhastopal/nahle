const router = require('express').Router();
const { Testimonial } = require('../models');
const { authMiddleware } = require('../middlewares/auth');
const { upload, processImage } = require('../middlewares/upload');

// Get all testimonials
router.get('/', async (req, res) => {
    try {
        const testimonials = await Testimonial.findAll({
            where: { is_active: true },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: testimonials });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Yorumlar alınamadı' });
    }
});

// Create testimonial (Admin)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const data = req.body;
        
        if (req.file) {
            const image = await processImage(req.file.buffer, 'testimonials');
            data.image = image.original;
        }
        
        const testimonial = await Testimonial.create(data);
        res.status(201).json({ success: true, data: testimonial });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Yorum oluşturulamadı' });
    }
});

// Update testimonial
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const testimonial = await Testimonial.findByPk(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Yorum bulunamadı' });
        }
        
        const updateData = req.body;
        if (req.file) {
            const image = await processImage(req.file.buffer, 'testimonials');
            updateData.image = image.original;
        }
        
        await testimonial.update(updateData);
        res.json({ success: true, data: testimonial });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Yorum güncellenemedi' });
    }
});

// Delete testimonial
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const testimonial = await Testimonial.findByPk(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ success: false, message: 'Yorum bulunamadı' });
        }
        await testimonial.destroy();
        res.json({ success: true, message: 'Yorum silindi' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Yorum silinemedi' });
    }
});

module.exports = router;
