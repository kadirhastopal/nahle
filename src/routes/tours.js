const router = require('express').Router();
const tourController = require('../controllers/tourController');
const { authMiddleware, roleMiddleware } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

// Public routes
router.get('/', tourController.getAll);
router.get('/:id', tourController.getById);

// Admin routes
router.post('/', 
    authMiddleware, 
    roleMiddleware(['admin', 'superadmin']), 
    upload.array('images', 10),
    tourController.create
);

router.put('/:id', 
    authMiddleware, 
    roleMiddleware(['admin', 'superadmin']), 
    upload.array('images', 10),
    tourController.update
);

router.delete('/:id', 
    authMiddleware, 
    roleMiddleware(['admin', 'superadmin']), 
    tourController.delete
);

module.exports = router;
