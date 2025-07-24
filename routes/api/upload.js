// routes/api/upload.js - YENİ DOSYA
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { Tour } = require('../../models');

// Auth middleware import
const authMiddleware = require('../../middleware/auth');

// Dosya yükleme dizinlerini oluştur
const uploadDirs = [
    'uploads/tours',
    'uploads/hotels/mekke',
    'uploads/hotels/medine'
];

uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Upload directory created: ${dir}`);
    }
});

// Tur resimleri için multer yapılandırması
const tourImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/tours/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'tour-' + uniqueSuffix + extension);
    }
});

// Otel resimleri için multer yapılandırması
const hotelImageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const hotelType = req.params.hotelType || 'general'; // mekke, medine, general
        const uploadPath = `uploads/hotels/${hotelType}`;
        
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'hotel-' + uniqueSuffix + extension);
    }
});

// Dosya filtreleme
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
    }
};

// Upload middleware'leri
const uploadTourImage = multer({
    storage: tourImageStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const uploadHotelImages = multer({
    storage: hotelImageStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// POST /api/upload/tour-image/:tourId - Tur ana resmi yükle
router.post('/tour-image/:tourId', authMiddleware, uploadTourImage.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Resim dosyası bulunamadı'
            });
        }

        const tourId = req.params.tourId;
        const imageUrl = `/uploads/tours/${req.file.filename}`;

        console.log(`📸 Tur resmi yükleniyor - Tour ID: ${tourId}, File: ${req.file.filename}`);

        // Eğer tourId varsa, tur bilgisini güncelle
        if (tourId && tourId !== 'temp') {
            const tour = await Tour.findByPk(tourId);
            if (!tour) {
                return res.status(404).json({
                    success: false,
                    message: 'Tur bulunamadı'
                });
            }

            // Eski resmi sil (eğer varsa)
            if (tour.image_url) {
                const oldImagePath = path.join(__dirname, '../../', tour.image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log(`🗑️ Eski resim silindi: ${tour.image_url}`);
                }
            }

            await tour.update({ image_url: imageUrl });
            console.log(`✅ Tur resmi güncellendi: ${imageUrl}`);
        }

        res.json({
            success: true,
            message: 'Resim başarıyla yüklendi',
            data: {
                imageUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size
            }
        });

    } catch (error) {
        console.error('❌ Tur resmi yükleme hatası:', error);
        
        // Hata durumunda yüklenen dosyayı sil
        if (req.file) {
            const filePath = req.file.path;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        res.status(500).json({
            success: false,
            message: 'Resim yüklenirken hata oluştu: ' + error.message
        });
    }
});

// POST /api/upload/hotel-images/:hotelType/:tourId - Otel resimleri yükle
router.post('/hotel-images/:hotelType/:tourId', authMiddleware, uploadHotelImages.array('images', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Resim dosyası bulunamadı'
            });
        }

        const { hotelType, tourId } = req.params; // mekke veya medine
        const imageUrls = req.files.map(file => `/uploads/hotels/${hotelType}/${file.filename}`);

        console.log(`🏨 ${hotelType} otel resimleri yükleniyor - Tour ID: ${tourId}, Files: ${req.files.length}`);

        // Eğer tourId varsa, tur bilgisini güncelle
        if (tourId && tourId !== 'temp') {
            const tour = await Tour.findByPk(tourId);
            if (tour) {
                const fieldName = `${hotelType}_hotel_images`;
                
                // Mevcut resimleri al
                let existingImages = [];
                try {
                    existingImages = tour[fieldName] ? JSON.parse(tour[fieldName]) : [];
                } catch (e) {
                    existingImages = [];
                }

                // Yeni resimleri ekle
                const updatedImages = [...existingImages, ...imageUrls];

                await tour.update({
                    [fieldName]: JSON.stringify(updatedImages)
                });

                console.log(`✅ ${hotelType} otel resimleri güncellendi`);
            }
        }

        res.json({
            success: true,
            message: `${hotelType} otel resimleri başarıyla yüklendi`,
            data: {
                imageUrls,
                count: req.files.length,
                files: req.files.map(file => ({
                    filename: file.filename,
                    originalName: file.originalname,
                    size: file.size,
                    url: `/uploads/hotels/${hotelType}/${file.filename}`
                }))
            }
        });

    } catch (error) {
        console.error(`❌ ${req.params.hotelType} otel resimleri yükleme hatası:`, error);
        
        // Hata durumunda yüklenen dosyaları sil
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Otel resimleri yüklenirken hata oluştu: ' + error.message
        });
    }
});

// DELETE /api/upload/tour-image/:tourId - Tur resmini sil
router.delete('/tour-image/:tourId', authMiddleware, async (req, res) => {
    try {
        const tourId = req.params.tourId;
        const tour = await Tour.findByPk(tourId);

        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tur bulunamadı'
            });
        }

        if (tour.image_url) {
            const imagePath = path.join(__dirname, '../../', tour.image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log(`🗑️ Tur resmi silindi: ${tour.image_url}`);
            }

            await tour.update({ image_url: null });
        }

        res.json({
            success: true,
            message: 'Tur resmi başarıyla silindi'
        });

    } catch (error) {
        console.error('❌ Tur resmi silme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Tur resmi silinirken hata oluştu: ' + error.message
        });
    }
});

// DELETE /api/upload/hotel-image/:hotelType/:tourId - Otel resmini sil
router.delete('/hotel-image/:hotelType/:tourId', authMiddleware, async (req, res) => {
    try {
        const { hotelType, tourId } = req.params;
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Silinecek resim URL\'i belirtilmedi'
            });
        }

        const tour = await Tour.findByPk(tourId);
        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tur bulunamadı'
            });
        }

        const fieldName = `${hotelType}_hotel_images`;
        let existingImages = [];
        
        try {
            existingImages = tour[fieldName] ? JSON.parse(tour[fieldName]) : [];
        } catch (e) {
            existingImages = [];
        }

        // Resmi listeden çıkar
        const updatedImages = existingImages.filter(img => img !== imageUrl);

        // Fiziksel dosyayı sil
        const imagePath = path.join(__dirname, '../../', imageUrl);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log(`🗑️ ${hotelType} otel resmi silindi: ${imageUrl}`);
        }

        // Veritabanını güncelle
        await tour.update({
            [fieldName]: JSON.stringify(updatedImages)
        });

        res.json({
            success: true,
            message: `${hotelType} otel resmi başarıyla silindi`
        });

    } catch (error) {
        console.error(`❌ ${req.params.hotelType} otel resmi silme hatası:`, error);
        res.status(500).json({
            success: false,
            message: 'Otel resmi silinirken hata oluştu: ' + error.message
        });
    }
});

// GET /api/upload/tour-images/:tourId - Tur resimlerini listele
router.get('/tour-images/:tourId', async (req, res) => {
    try {
        const tourId = req.params.tourId;
        const tour = await Tour.findByPk(tourId);

        if (!tour) {
            return res.status(404).json({
                success: false,
                message: 'Tur bulunamadı'
            });
        }

        const images = {
            main_image: tour.image_url,
            mekke_hotel_images: [],
            medine_hotel_images: []
        };

        // Mekke otel resimleri
        if (tour.mekke_hotel_images) {
            try {
                images.mekke_hotel_images = JSON.parse(tour.mekke_hotel_images);
            } catch (e) {
                images.mekke_hotel_images = [];
            }
        }

        // Medine otel resimleri
        if (tour.medine_hotel_images) {
            try {
                images.medine_hotel_images = JSON.parse(tour.medine_hotel_images);
            } catch (e) {
                images.medine_hotel_images = [];
            }
        }

        res.json({
            success: true,
            data: images
        });

    } catch (error) {
        console.error('❌ Tur resimleri listeleme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Tur resimleri alınırken hata oluştu: ' + error.message
        });
    }
});

// Error handling middleware
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'Dosya boyutu çok büyük. Maksimum 5MB olabilir.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Çok fazla dosya. Maksimum 10 resim yükleyebilirsiniz.'
            });
        }
    }
    
    if (error.message === 'Sadece resim dosyaları yüklenebilir!') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    console.error('❌ Upload error:', error);
    res.status(500).json({
        success: false,
        message: 'Dosya yükleme hatası: ' + error.message
    });
});

module.exports = router;