const router = require('express').Router();
const tourController = require('../controllers/tourController');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');
const { upload, processImage } = require('../utils/imageUpload');

// Public routes
router.get('/', tourController.getAll);
router.get('/:id', tourController.getById);

// Admin routes with image upload
router.post('/', 
    authMiddleware, 
    roleMiddleware(['admin', 'superadmin']), 
    upload.array('images', 5),
    async (req, res) => {
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
                    const image = await processImage(file, 'tours');
                    tourData.images.push(image);
                }
            }
            
            const { Tour } = require('../models');
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
    }
);

router.put('/:id', 
    authMiddleware, 
    roleMiddleware(['admin', 'superadmin']), 
    upload.array('images', 5),
    tourController.update
);

router.delete('/:id', 
    authMiddleware, 
    roleMiddleware(['admin', 'superadmin']), 
    tourController.delete
);

module.exports = router;
