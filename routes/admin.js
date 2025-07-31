const express = require('express');
const jwt = require('jsonwebtoken');
const { AdminUser, Category, Tour, ContactMessage } = require('../models');
const { authenticateAdmin } = require('../middleware/auth');

const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const admin = await AdminUser.findOne({ where: { username } });
    if (!admin || !await admin.comparePassword(password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
    
    // Update last login
    await admin.update({ last_login: new Date() });
    
    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          full_name: admin.full_name
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Protected routes
router.use(authenticateAdmin);

// Dashboard Stats
router.get('/dashboard', async (req, res) => {
  try {
    const stats = {
      totalTours: await Tour.count(),
      activeTours: await Tour.count({ where: { status: 'active' } }),
      totalCategories: await Category.count(),
      newMessages: await ContactMessage.count({ where: { status: 'new' } })
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Tours CRUD
router.get('/tours', async (req, res) => {
  try {
    const tours = await Tour.findAll({
      include: [{ model: Category, attributes: ['name'] }],
      order: [['created_at', 'DESC']]
    });
    
    res.json({ success: true, data: { tours } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/tours', async (req, res) => {
  try {
    const tour = await Tour.create(req.body);
    res.json({ success: true, data: { tour } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/tours/:id', async (req, res) => {
  try {
    const [updated] = await Tour.update(req.body, { where: { id: req.params.id } });
    if (updated) {
      const tour = await Tour.findByPk(req.params.id);
      res.json({ success: true, data: { tour } });
    } else {
      res.status(404).json({ success: false, message: 'Tour not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/tours/:id', async (req, res) => {
  try {
    const deleted = await Tour.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.json({ success: true, message: 'Tour deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Tour not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Categories CRUD
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['sort_order', 'ASC']] });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Messages
router.get('/messages', async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({ order: [['created_at', 'DESC']] });
    res.json({ success: true, data: { messages } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

// Image Upload Routes
const { upload, processAndSaveImage } = require('../middleware/upload');

// Tour images upload
router.post('/upload/tour-images', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const uploadedFiles = [];
    
    for (const file of req.files) {
      const sizes = [
        { name: 'thumb', width: 300, height: 200 },
        { name: 'medium', width: 800, height: 600 },
        { name: 'large', width: 1200, height: 800 }
      ];
      
      const savedFiles = await processAndSaveImage(file.buffer, 'tours', sizes);
      uploadedFiles.push({
        filename: savedFiles.original,
        url: `/uploads/tours/${savedFiles.original}`,
        thumbnails: {
          thumb: `/uploads/tours/${savedFiles.thumb}`,
          medium: `/uploads/tours/${savedFiles.medium}`,
          large: `/uploads/tours/${savedFiles.large}`
        }
      });
    }

    res.json({
      success: true,
      data: { files: uploadedFiles }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed: ' + error.message });
  }
});

// Hotel images upload
router.post('/upload/hotel-images', upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const uploadedFiles = [];
    
    for (const file of req.files) {
      const sizes = [
        { name: 'thumb', width: 200, height: 150 },
        { name: 'medium', width: 600, height: 400 }
      ];
      
      const savedFiles = await processAndSaveImage(file.buffer, 'hotels', sizes);
      uploadedFiles.push({
        filename: savedFiles.original,
        url: `/uploads/hotels/${savedFiles.original}`,
        thumbnails: {
          thumb: `/uploads/hotels/${savedFiles.thumb}`,
          medium: `/uploads/hotels/${savedFiles.medium}`
        }
      });
    }

    res.json({
      success: true,
      data: { files: uploadedFiles }
    });
  } catch (error) {
    console.error('Hotel upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed: ' + error.message });
  }
});

// Delete image
router.delete('/upload/:folder/:filename', async (req, res) => {
  try {
    const { folder, filename } = req.params;
    const filePath = path.join(__dirname, '..', 'uploads', folder, filename);
    
    await fs.unlink(filePath).catch(() => {}); // Ignore if file doesn't exist
    
    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Delete failed' });
  }
});

// Categories CRUD
router.post('/categories', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.json({ success: true, data: { category } });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const [updated] = await Category.update(req.body, { where: { id: req.params.id } });
    if (updated) {
      const category = await Category.findByPk(req.params.id);
      res.json({ success: true, data: { category } });
    } else {
      res.status(404).json({ success: false, message: 'Category not found' });
    }
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const deleted = await Category.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.json({ success: true, message: 'Category deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Category not found' });
    }
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Messages routes
router.put('/messages/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const [updated] = await ContactMessage.update({ status }, { where: { id: req.params.id } });
    
    if (updated) {
      const message = await ContactMessage.findByPk(req.params.id);
      res.json({ success: true, data: { message } });
    } else {
      res.status(404).json({ success: false, message: 'Message not found' });
    }
  } catch (error) {
    console.error('Update message status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/messages/mark-all-read', async (req, res) => {
  try {
    await ContactMessage.update({ status: 'read' }, { where: { status: 'new' } });
    res.json({ success: true, message: 'All messages marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/messages/:id', async (req, res) => {
  try {
    const deleted = await ContactMessage.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.json({ success: true, message: 'Message deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Message not found' });
    }
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Settings routes
router.get('/settings', async (req, res) => {
  try {
    const settingsRows = await sequelize.query(
      'SELECT setting_key, setting_value FROM site_settings',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    // Convert array to object
    const settings = {};
    settingsRows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    
    res.json({ success: true, data: { settings } });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const settingsData = req.body;
    
    // Update each setting
    for (const [key, value] of Object.entries(settingsData)) {
      await sequelize.query(
        'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        { replacements: [key, value, value] }
      );
    }
    
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Save settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Logo upload route
router.post('/upload/logo', upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No logo file uploaded' });
    }

    const sizes = [
      { name: 'logo', width: 300, height: 100 }
    ];
    
    const savedFiles = await processAndSaveImage(req.file.buffer, 'brand', sizes);
    
    // Save logo URL to settings
    await sequelize.query(
      'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      { replacements: ['logo_url', `/uploads/brand/${savedFiles.logo}`, `/uploads/brand/${savedFiles.logo}`] }
    );
    
    res.json({
      success: true,
      data: { 
        url: `/uploads/brand/${savedFiles.logo}`,
        filename: savedFiles.logo
      }
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ success: false, message: 'Logo upload failed: ' + error.message });
  }
});

// Favicon upload route
router.post('/upload/favicon', upload.single('favicon'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No favicon file uploaded' });
    }

    const sizes = [
      { name: 'favicon', width: 32, height: 32 }
    ];
    
    const savedFiles = await processAndSaveImage(req.file.buffer, 'brand', sizes);
    
    // Save favicon URL to settings
    await sequelize.query(
      'INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
      { replacements: ['favicon_url', `/uploads/brand/${savedFiles.favicon}`, `/uploads/brand/${savedFiles.favicon}`] }
    );
    
    res.json({
      success: true,
      data: { 
        url: `/uploads/brand/${savedFiles.favicon}`,
        filename: savedFiles.favicon
      }
    });
  } catch (error) {
    console.error('Favicon upload error:', error);
    res.status(500).json({ success: false, message: 'Favicon upload failed: ' + error.message });
  }
});

// SMTP test route
router.post('/test-smtp', async (req, res) => {
  try {
    // Get SMTP settings from database
    const settingsRows = await sequelize.query(
      'SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN (?, ?, ?, ?, ?, ?, ?)',
      { 
        replacements: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_encryption', 'smtp_from_name', 'contact_form_email'],
        type: sequelize.QueryTypes.SELECT 
      }
    );
    
    const settings = {};
    settingsRows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    
    if (!settings.smtp_host || !settings.smtp_user || !settings.smtp_pass) {
      return res.status(400).json({ 
        success: false, 
        message: 'SMTP ayarları eksik. Host, kullanıcı adı ve şifre gerekli.' 
      });
    }
    
    // TODO: Implement actual SMTP test here
    // For now, just return success
    res.json({ 
      success: true, 
      message: 'SMTP test başarılı! (Test fonksiyonu gelecek güncellemede eklenecek)' 
    });
  } catch (error) {
    console.error('SMTP test error:', error);
    res.status(500).json({ success: false, message: 'SMTP test failed: ' + error.message });
  }
});
