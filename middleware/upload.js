const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Multer storage configuration
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Sadece JPEG, PNG ve WebP formatları desteklenir'), false);
    }
  }
});

// Image processing function
const processAndSaveImage = async (buffer, folder, sizes = []) => {
  const filename = uuidv4();
  const uploadDir = path.join(__dirname, '..', 'uploads', folder);
  
  // Create directory if it doesn't exist
  await fs.mkdir(uploadDir, { recursive: true });
  
  const savedFiles = {};
  
  // Original size
  const originalPath = path.join(uploadDir, `${filename}.webp`);
  await sharp(buffer)
    .webp({ quality: 90 })
    .toFile(originalPath);
  savedFiles.original = `${filename}.webp`;
  
  // Generate different sizes if specified
  for (const size of sizes) {
    const sizePath = path.join(uploadDir, `${filename}_${size.name}.webp`);
    await sharp(buffer)
      .resize(size.width, size.height, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(sizePath);
    savedFiles[size.name] = `${filename}_${size.name}.webp`;
  }
  
  return savedFiles;
};

module.exports = { upload, processAndSaveImage };
