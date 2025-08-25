const router = require('express').Router();
const { Blog } = require('../models');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');
const { upload, processImage } = require('../middlewares/upload');

// Get all blogs
router.get('/', async (req, res) => {
    try {
        const blogs = await Blog.findAll({
            where: { is_published: true },
            order: [['published_at', 'DESC']]
        });
        res.json({ success: true, data: blogs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Bloglar alınamadı' });
    }
});

// Get single blog
router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findByPk(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog bulunamadı' });
        }
        blog.views += 1;
        await blog.save();
        res.json({ success: true, data: blog });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Blog alınamadı' });
    }
});

// Create blog (Admin)
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const blogData = req.body;
        blogData.slug = blogData.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        if (req.file) {
            const image = await processImage(req.file.buffer, 'blogs');
            blogData.image = image.original;
        }
        
        const blog = await Blog.create(blogData);
        res.status(201).json({ success: true, data: blog });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Blog oluşturulamadı' });
    }
});

// Update blog
router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const blog = await Blog.findByPk(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog bulunamadı' });
        }
        
        const updateData = req.body;
        if (req.file) {
            const image = await processImage(req.file.buffer, 'blogs');
            updateData.image = image.original;
        }
        
        await blog.update(updateData);
        res.json({ success: true, data: blog });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Blog güncellenemedi' });
    }
});

// Delete blog
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const blog = await Blog.findByPk(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog bulunamadı' });
        }
        await blog.destroy();
        res.json({ success: true, message: 'Blog silindi' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Blog silinemedi' });
    }
});

module.exports = router;
