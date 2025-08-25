const router = require('express').Router();
const { Settings } = require('../models');
const { authMiddleware } = require('../middlewares/auth');

// Get all settings (Public for frontend)
router.get('/', async (req, res) => {
    try {
        const settings = await Settings.findAll();
        const settingsObj = {};
        
        settings.forEach(setting => {
            if (setting.type === 'json') {
                settingsObj[setting.key] = JSON.parse(setting.value);
            } else if (setting.type === 'boolean') {
                settingsObj[setting.key] = setting.value === 'true';
            } else if (setting.type === 'number') {
                settingsObj[setting.key] = Number(setting.value);
            } else {
                settingsObj[setting.key] = setting.value;
            }
        });
        
        res.json({ success: true, data: settingsObj });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Ayarlar alınamadı' 
        });
    }
});

// Update settings (Admin)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const updates = req.body;
        
        for (const [key, value] of Object.entries(updates)) {
            let settingValue = value;
            let settingType = 'text';
            
            if (typeof value === 'object') {
                settingValue = JSON.stringify(value);
                settingType = 'json';
            } else if (typeof value === 'boolean') {
                settingValue = value.toString();
                settingType = 'boolean';
            } else if (typeof value === 'number') {
                settingValue = value.toString();
                settingType = 'number';
            }
            
            await Settings.upsert({
                key,
                value: settingValue,
                type: settingType
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Ayarlar güncellendi' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Ayarlar güncellenemedi' 
        });
    }
});

module.exports = router;
