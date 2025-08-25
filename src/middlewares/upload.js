const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Sadece resim dosyaları yüklenebilir'));
        }
    }
});

const processImage = async (buffer, folder, filename) => {
    const uploadPath = path.join(__dirname, '../../public/uploads', folder);
    
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    const timestamp = Date.now();
    const name = filename || `image-${timestamp}`;
    
    // Original
    await sharp(buffer)
        .resize(1200, null, { withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(path.join(uploadPath, `${name}.webp`));
    
    // Thumbnail
    await sharp(buffer)
        .resize(400, 300, { fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(path.join(uploadPath, `${name}-thumb.webp`));
    
    return {
        original: `/uploads/${folder}/${name}.webp`,
        thumbnail: `/uploads/${folder}/${name}-thumb.webp`
    };
};

module.exports = { upload, processImage };
