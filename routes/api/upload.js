// routes/api/upload.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const { upload, createThumbnails } = require('../../middleware/upload');
const { Tour } = require('../../models');
const router = express.Router();

// Auth middleware (admin paneli için)
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Erişim reddedildi. Token gerekli.'
            });
        }
        
        const jwt = require('jsonwebtoken');
        const { AdminUser } = require('../../models');
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await AdminUser.findByPk(decoded.id);
        
        if (!user || user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz token'
            });
        }
        
        req.user = user;
        next();
        
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Geçersiz token'
        });
    }
};

// POST /api/upload/tour-image - Tur görseli yükle
router.post('/tour-image', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Dosya seçilmedi'
            });
        }

        const { tourId } = req.body;
        
        if (!tourId) {
            return res.status(400).json({
                success: false,
                message: 'Tur ID gerekli'
            });
        }

        // Check if tour exists
        const tour = await Tour.findByPk(tourId);
        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tur bulunamadı'
            });
        }

        const filePath = req.file.path;
        const filename = req.file.filename;
        
        // Create thumbnails
        const thumbnailsCreated = await createThumbnails(filePath, filename);
        
        if (!thumbnailsCreated) {
            return res.status(500).json({
                success: false,
                message: 'Thumbnail oluşturma hatası'
            });
        }

        // Update tour with image info
        const baseName = path.parse(filename).name;
        const imageData = {
            original: filename,
            large: `${baseName}_large.jpg`,
            medium: `${baseName}_medium.jpg`,
            thumb: `${baseName}_thumb.jpg`
        };

        // Update tour's featured_image or add to gallery
        let gallery = tour.gallery ? [...tour.gallery] : [];
        
        if (!tour.featured_image) {
            // Set as featured image if none exists
            await tour.update({ featured_image: JSON.stringify(imageData) });
        } else {
            // Add to gallery
            gallery.push(imageData);
            await tour.update({ gallery: gallery });
        }

        res.json({
            success: true,
            message: 'Görsel başarıyla yüklendi',
            data: {
                image: imageData,
                isFeatured: !tour.featured_image
            }
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Görsel yükleme hatası'
        });
    }
});

// DELETE /api/upload/tour-image/:tourId/:imageId - Görsel sil
router.delete('/tour-image/:tourId/:imageId', authMiddleware, async (req, res) => {
    try {
        const { tourId, imageId } = req.params;
        
        const tour = await Tour.findByPk(tourId);
        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tur bulunamadı'
            });
        }

        // Remove from file system
        const uploadDir = 'uploads/tours/';
        const filesToDelete = [
            `${imageId}.jpg`,
            `${imageId}_large.jpg`,
            `${imageId}_medium.jpg`,
            `${imageId}_thumb.jpg`
        ];

        filesToDelete.forEach(file => {
            const filePath = path.join(uploadDir, file);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        // Update database
        let featuredImage = tour.featured_image ? JSON.parse(tour.featured_image) : null;
        let gallery = tour.gallery || [];

        if (featuredImage && featuredImage.original.includes(imageId)) {
            featuredImage = null;
        }

        gallery = gallery.filter(img => !img.original.includes(imageId));

        await tour.update({
            featured_image: featuredImage ? JSON.stringify(featuredImage) : null,
            gallery: gallery
        });

        res.json({
            success: true,
            message: 'Görsel başarıyla silindi'
        });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Görsel silme hatası'
        });
    }
});

module.exports = router;
