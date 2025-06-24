// routes/api/contact.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const { ContactMessage } = require('../../models');
const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Doğrulama hatası',
            errors: errors.array()
        });
    }
    next();
};

// POST /api/contact - İletişim formu gönder
router.post('/', [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('İsim 2-100 karakter arasında olmalıdır'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Geçerli bir e-posta adresi giriniz'),
    body('phone')
        .optional()
        .isMobilePhone('tr-TR')
        .withMessage('Geçerli bir telefon numarası giriniz'),
    body('tour_type')
        .optional()
        .isIn(['hac', 'umre', 'both', 'other'])
        .withMessage('Geçerli bir tur tipi seçiniz'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 2000 })
        .withMessage('Mesaj 10-2000 karakter arasında olmalıdır'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { name, email, phone, tour_type, message } = req.body;
        
        // IP adresi ve user agent bilgilerini al
        const ip_address = req.ip || req.connection.remoteAddress;
        const user_agent = req.get('User-Agent');
        
        // İletişim mesajını veritabanına kaydet
        const contactMessage = await ContactMessage.create({
            name: name.trim(),
            email: email.toLowerCase(),
            phone: phone?.trim(),
            tour_type,
            message: message.trim(),
            ip_address,
            user_agent
        });
        
        // Başarılı yanıt
        res.status(201).json({
            success: true,
            message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
            data: {
                id: contactMessage.id,
                created_at: contactMessage.created_at
            }
        });
        
        // TODO: E-posta gönderme işlemi burada yapılacak
        // await sendEmailNotification(contactMessage);
        
    } catch (error) {
        console.error('Contact form error:', error);
        
        // Duplicate email kontrolü
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                success: false,
                message: 'Bu e-posta adresi ile zaten bir mesaj gönderilmiş'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'
        });
    }
});

// GET /api/contact/stats - İletişim istatistikleri (admin için)
router.get('/stats', async (req, res) => {
    try {
        const stats = await ContactMessage.getStats();
        const tourTypeStats = await ContactMessage.getTourTypeStats();
        
        res.json({
            success: true,
            data: {
                general: stats,
                tour_types: tourTypeStats
            }
        });
        
    } catch (error) {
        console.error('Contact stats error:', error);
        res.status(500).json({
            success: false,
            message: 'İstatistikler alınırken hata oluştu'
        });
    }
});

module.exports = router;
