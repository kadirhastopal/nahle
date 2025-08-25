const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Multer config
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Sadece resim dosyaları yüklenebilir'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: fileFilter
});

// Process and save image
const processImage = async (file, folder) => {
    const uploadDir = path.join(__dirname, '../../public/uploads', folder);
    
    // Create directory if not exists
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname.replace(/\s/g, '-')}`;
    const filepath = path.join(uploadDir, filename);
    
    // Process with sharp
    await sharp(file.buffer)
        .resize(1200, null, { 
            withoutEnlargement: true,
            fit: 'inside'
        })
        .jpeg({ quality: 85 })
        .toFile(filepath);
    
    // Create thumbnail
    const thumbPath = path.join(uploadDir, `thumb-${filename}`);
    await sharp(file.buffer)
        .resize(400, 300, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(thumbPath);
    
    return {
        original: `/uploads/${folder}/${filename}`,
        thumbnail: `/uploads/${folder}/thumb-${filename}`
    };
};

module.exports = { upload, processImage };
