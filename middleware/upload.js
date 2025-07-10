// middleware/upload.js
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/tours/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Sadece resim dosyaları yüklenebilir'));
    }
};

// Multer configuration
const upload = multer({
    storage,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter
});

// Thumbnail creation function
const createThumbnails = async (filePath, filename) => {
    const baseName = path.parse(filename).name;
    const uploadDir = path.dirname(filePath);
    
    try {
        // Large thumbnail (800x600)
        await sharp(filePath)
            .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toFile(path.join(uploadDir, `${baseName}_large.jpg`));
        
        // Medium thumbnail (400x300)
        await sharp(filePath)
            .resize(400, 300, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toFile(path.join(uploadDir, `${baseName}_medium.jpg`));
        
        // Small thumbnail (150x150)
        await sharp(filePath)
            .resize(150, 150, { fit: 'cover' })
            .jpeg({ quality: 75 })
            .toFile(path.join(uploadDir, `${baseName}_thumb.jpg`));
        
        console.log(`✅ Thumbnails created for: ${filename}`);
        return true;
    } catch (error) {
        console.error('❌ Thumbnail creation error:', error);
        return false;
    }
};

module.exports = {
    upload,
    createThumbnails
};
