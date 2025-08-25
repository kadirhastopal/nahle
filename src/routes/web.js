const router = require('express').Router();
const { Tour, Blog, Testimonial, Settings } = require('../models');

// Ana sayfa
router.get('/', async (req, res) => {
    try {
        const featuredTours = await Tour.findAll({
            where: { is_featured: true, is_active: true },
            limit: 6,
            order: [['departure_date', 'ASC']]
        });
        
        const testimonials = await Testimonial.findAll({
            where: { is_featured: true, is_active: true },
            limit: 6,
            order: [['createdAt', 'DESC']]
        });
        
        const blogs = await Blog.findAll({
            where: { is_published: true },
            limit: 3,
            order: [['published_at', 'DESC']]
        });
        
        res.render('index', {
            tours: featuredTours,
            testimonials,
            blogs
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Sayfa yüklenemedi');
    }
});

// Hac turları
router.get('/hac-turlari', async (req, res) => {
    try {
        const tours = await Tour.findAll({
            where: { type: 'hac', is_active: true },
            order: [['departure_date', 'ASC']]
        });
        
        res.render('tours', {
            title: 'Hac Turları',
            tours,
            type: 'hac'
        });
    } catch (error) {
        res.status(500).send('Sayfa yüklenemedi');
    }
});

// Umre turları
router.get('/umre-turlari', async (req, res) => {
    try {
        const tours = await Tour.findAll({
            where: { type: 'umre', is_active: true },
            order: [['departure_date', 'ASC']]
        });
        
        res.render('tours', {
            title: 'Umre Turları',
            tours,
            type: 'umre'
        });
    } catch (error) {
        res.status(500).send('Sayfa yüklenemedi');
    }
});

// Tur detay
router.get('/tur/:slug', async (req, res) => {
    try {
        const tour = await Tour.findOne({
            where: { slug: req.params.slug, is_active: true }
        });
        
        if (!tour) {
            return res.status(404).send('Tur bulunamadı');
        }
        
        res.render('tour-detail', { tour });
    } catch (error) {
        res.status(500).send('Sayfa yüklenemedi');
    }
});

// Blog listesi
router.get('/blog', async (req, res) => {
    try {
        const blogs = await Blog.findAll({
            where: { is_published: true },
            order: [['published_at', 'DESC']]
        });
        
        res.render('blog', { blogs });
    } catch (error) {
        res.status(500).send('Sayfa yüklenemedi');
    }
});

// Blog detay
router.get('/blog/:slug', async (req, res) => {
    try {
        const blog = await Blog.findOne({
            where: { slug: req.params.slug, is_published: true }
        });
        
        if (!blog) {
            return res.status(404).send('Blog yazısı bulunamadı');
        }
        
        blog.views += 1;
        await blog.save();
        
        res.render('blog-detail', { blog });
    } catch (error) {
        res.status(500).send('Sayfa yüklenemedi');
    }
});

// İletişim
router.get('/iletisim', (req, res) => {
    res.render('contact');
});

// Hakkımızda
router.get('/hakkimizda', (req, res) => {
    res.render('about');
});

// Admin panel
router.get('/admin', (req, res) => {
    res.sendFile('index.html', { root: 'public/admin' });
});

module.exports = router;
